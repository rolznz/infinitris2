import { INITIAL_FALL_DELAY } from '@core/block/Block';
import { GameModeEvent } from '@models/GameModeEvent';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

export interface IColumnCapture {
  playerId?: number;
}

type ColumnConquestGameModeState = {
  columnCaptures: IColumnCapture[];
};

export class ColumnConquestGameMode
  implements IGameMode<ColumnConquestGameModeState>
{
  private _columnCaptures: IColumnCapture[];
  private _simulation: ISimulation;
  private _lastCalculationTime: number;

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._columnCaptures = [];
    this._lastCalculationTime = 0;
  }

  get columnCaptures(): IColumnCapture[] {
    return this._columnCaptures;
  }

  get hasRounds(): boolean {
    return true;
  }
  get hasHealthbars(): boolean {
    return true;
  }
  get hasLineClearReward(): boolean {
    return false;
  }
  get hasBlockPlacementReward(): boolean {
    return false;
  }

  step(): void {
    const now = Date.now();
    if (now - this._lastCalculationTime < 1000) {
      return;
    }
    this._lastCalculationTime = now;

    const activePlayers = this._simulation.players.filter(
      (player) => player.status === PlayerStatus.ingame
    );

    const healthChangeSpeed =
      (1 + this._simulation.round!.currentRoundDuration / 10000) *
      0.001 *
      (this._simulation.settings.roundLength === 'short'
        ? 5
        : this._simulation.settings.roundLength === 'long'
        ? 1
        : 3);
    for (const player of activePlayers) {
      player.health = Math.max(player.health - healthChangeSpeed, 0);
      if (player.health === 0) {
        if (!this._simulation.isNetworkClient) {
          player.status = PlayerStatus.knockedOut;
        }
      }
    }
  }

  onPlayerDestroyed(player: IPlayer): void {
    this._removePlayer(player);
  }
  private _removePlayer(player: IPlayer) {
    for (let c = 0; c < this._columnCaptures.length; c++) {
      if (this._columnCaptures[c].playerId === player.id) {
        this._columnCaptures[c].playerId = undefined;
      }
    }
  }
  onPlayerChangeStatus(player: IPlayer): void {
    if (player.status !== PlayerStatus.ingame) {
      this._removePlayer(player);
    }
  }

  onBlockPlaced(block: IBlock): void {
    this._checkColumns();
  }
  onBlockDied(block: IBlock): void {
    block.player.health = Math.max(block.player.health - 0.1, 0);
  }
  onLinesCleared(): void {
    this._checkColumns();
  }

  onNextRound() {
    this._columnCaptures = [...new Array(this._simulation.grid.numColumns)].map(
      () => ({})
    );
    this._lastCalculationTime = 0;
  }

  private _checkColumns() {
    for (let c = 0; c < this._simulation.grid.numColumns; c++) {
      const cell =
        this._simulation.grid.cells[this._simulation.grid.numRows - 1][c];
      if (cell.player?.id != this._columnCaptures[c].playerId) {
        this._columnCaptures[c].playerId = cell.player?.id;
        if (cell.player) {
          cell.player.health = Math.min(cell.player.health + 0.05, 1);
        }
        this._simulation.onGameModeEvent({
          type: 'columnChanged',
          column: cell.column,
        });
      }
    }
    const activePlayers = this._simulation.players.filter(
      (player) => player.status === PlayerStatus.ingame
    );
    for (const player of activePlayers) {
      player.score = this._columnCaptures.filter(
        (c) => c.playerId === player.id
      ).length;
    }
  }

  serialize(): ColumnConquestGameModeState {
    return {
      columnCaptures: this._columnCaptures,
    };
  }

  deserialize(state: ColumnConquestGameModeState) {
    this._columnCaptures = state.columnCaptures;
  }

  getFallDelay(player: IPlayer) {
    return (
      INITIAL_FALL_DELAY -
      Math.pow(player.score / this._simulation.grid.numColumns, 0.25) *
        INITIAL_FALL_DELAY
    );
  }
}
