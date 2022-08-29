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
    if (this._simulation.isNetworkClient) {
      return;
    }
    const activePlayers = this._simulation.players.filter(
      (player) => player.status === PlayerStatus.ingame
    );
    for (const player of activePlayers) {
      // TODO: optimize - this is checking every single cell in the grid
      const placableCellsCount = this._simulation.grid.reducedCells.filter(
        (cell) => conquestCanPlace(player, this._simulation, cell)
      ).length;
      if (!player.isFirstBlock && placableCellsCount === 0) {
        player.status = PlayerStatus.knockedOut;
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
      if (conquestCanPlace(player, this._simulation, cell)) {
        isMistake = false;
        break;
      }
    }
    return isMistake;
  }
}

export function conquestCanPlace(
  player: IPlayer,
  simulation: ISimulation,
  cell: ICell
) {
  if (!cell?.isEmpty) {
    return false;
  }
  if (cell.row === simulation.grid.numRows - 1 && cell.isEmpty) {
    return true;
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
  return canPlace;
}
