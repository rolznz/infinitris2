import { wrap } from '@core/utils/wrap';
import { GameModeEvent } from '@models/GameModeEvent';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type ConquestGameModeState = {};

export class ConquestGameMode implements IGameMode<ConquestGameModeState> {
  private _simulation: ISimulation;
  private _lastCalculationTime: number;

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._lastCalculationTime = 0;
  }

  get hasRounds(): boolean {
    return true;
  }
  get hasHealthbars(): boolean {
    return false;
  }

  step(): void {
    // const now = Date.now();
    // if (now - this._lastCalculationTime < 1000) {
    //   return;
    // }
    // this._lastCalculationTime = now;
    // const activePlayers = this._simulation.players.filter(
    //   (player) => player.status === PlayerStatus.ingame
    // );
    // const healthChangeSpeed =
    //   (1 + this._simulation.round!.currentRoundDuration / 10000) *
    //   0.001 *
    //   (this._simulation.settings.roundLength === 'short'
    //     ? 5
    //     : this._simulation.settings.roundLength === 'long'
    //     ? 1
    //     : 3);
    // for (const player of activePlayers) {
    //   player.health = Math.max(player.health - healthChangeSpeed, 0);
    //   if (player.health === 0) {
    //     if (!this._simulation.isNetworkClient) {
    //       player.status = PlayerStatus.knockedOut;
    //     }
    //   }
    // }
  }

  onLinesCleared() {
    this._calculateKnockouts();
  }
  onBlockRemoved() {
    this._calculateKnockouts();
  }
  private _calculateKnockouts() {
    const activePlayers = this._simulation.players.filter(
      (player) => player.status === PlayerStatus.ingame
    );
    for (const player of activePlayers) {
      // TODO: optimize - this is checking every single cell in the grid
      const placableCellsCount = this._simulation.grid.reducedCells.filter(
        (cell) => conquestCanPlace(player, this._simulation, cell).canPlace
      ).length;
      if (!player.isFirstBlock && placableCellsCount === 0) {
        if (!this._simulation.isNetworkClient) {
          player.status = PlayerStatus.knockedOut;
        }
      } else {
        player.score = placableCellsCount;
      }
    }
  }

  onNextRound() {
    this._lastCalculationTime = 0;
  }

  serialize(): ConquestGameModeState {
    return {};
  }

  deserialize(state: ConquestGameModeState) {}

  checkMistake(player: IPlayer, cells: ICell[], isMistake: boolean): boolean {
    if (isMistake) {
      return true;
    }

    isMistake = true;
    for (const cell of cells) {
      if (conquestCanPlace(player, this._simulation, cell).canPlace) {
        isMistake = false;
        break;
      }
    }
    return isMistake;
  }
}

type ConquestCanPlaceResult = {
  canPlace: boolean;
  isStalemate: boolean;
};

let forgivingTowerRows: { row: number; checkTimeMs: number }[] = [];

export function conquestCanPlace(
  player: IPlayer,
  simulation: ISimulation,
  cell: ICell,
  isForgiving = true
): ConquestCanPlaceResult {
  if (
    !cell.isEmpty &&
    (!isForgiving || !cell.wasRecentlyPlaced(simulation.forgivingPlacementTime))
  ) {
    return { canPlace: false, isStalemate: false };
  }

  // only allow placement on empty sections if first block
  if (
    player.isFirstBlock &&
    cell.row === simulation.grid.numRows - 1 &&
    (cell.isEmpty ||
      (isForgiving &&
        cell.wasRecentlyPlaced(simulation.forgivingPlacementTime)))
  ) {
    return { canPlace: true, isStalemate: false };
  }

  // check for stalemates - the cell is within two towers that touch the ceiling
  // in the below scenario, no one would be able to place between A's blocks because they are touching the tower height.
  // instead, make that entire gap free for all players to drop.
  //  ------------------
  //  AA              AA
  //  AA              AA
  //  AA              AA
  //  AA              AA
  // due to tower height not being forgiving (it can change instantly, we store all recent tower heights)
  // TODO: make this more efficient (don't recalculate every single check)
  const currentTowerRow = simulation.grid.getTowerRow();
  forgivingTowerRows = forgivingTowerRows.filter(
    (entry) =>
      entry.row !== currentTowerRow &&
      entry.checkTimeMs > Date.now() - simulation.forgivingPlacementTime
  );
  forgivingTowerRows.push({ row: currentTowerRow, checkTimeMs: Date.now() });

  for (const forgivingTowerRow of forgivingTowerRows) {
    const touchingCeilingHeight = forgivingTowerRow.row + 1;
    if (cell.row >= touchingCeilingHeight) {
      // TODO: verify if it really needs to be the same player. 2 players could potentially abuse this
      const hasTower: IPlayer[][] = [[], []];
      for (let i = 0; i < hasTower.length; i++) {
        for (
          let columnOffset = 0;
          columnOffset < Math.floor(simulation.grid.numColumns / 4);
          columnOffset++
        ) {
          const neighbour = simulation.grid.getNeighbour(
            cell,
            columnOffset * (i === 0 ? 1 : -1),
            touchingCeilingHeight - cell.row
          );
          if (!neighbour?.isEmpty && neighbour?.player) {
            hasTower[i].push(neighbour.player);
          }
        }
      }
      if (hasTower[0].some((player) => hasTower[1].indexOf(player) >= 0)) {
        // someone created a tower
        return { canPlace: true, isStalemate: true };
      }
    }
  }

  // allow a player (B) to place on a column next to any of their cells, as long as one of their cells on a neighbour column is above
  // where "X" is player B's next block
  //   BB
  //   AB
  //   ABBB
  //   AAAB
  //   AAAB
  // XXAAAB
  // XXAAAB

  let canPlace = false;
  [-1, 1, 0].forEach((neighbourDirection) => {
    const neighbourColumn = wrap(
      cell.column + neighbourDirection,
      simulation.grid.numColumns
    );
    for (
      let row = 0;
      row < Math.min(cell.row + 2, simulation.grid.numRows);
      row++
    ) {
      canPlace =
        canPlace ||
        simulation.grid.cells[row][neighbourColumn].player === player;
    }
  });

  return { canPlace, isStalemate: false };
}
