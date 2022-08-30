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

  let canPlace = false;
  [
    [-1, 0],
    [1, 0],
    [0, 1],
  ].forEach((neighbourDirection) => {
    const neighbour = simulation.grid.getNeighbour(
      cell,
      neighbourDirection[0],
      neighbourDirection[1]
    );
    if (neighbour) {
      canPlace = canPlace || neighbour.player === player;
    }
  });

  if (canPlace) {
    return { canPlace: true, isStalemate: false };
  }

  return { canPlace: false, isStalemate: false };
}
