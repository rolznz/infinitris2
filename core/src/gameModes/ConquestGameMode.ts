import { GameModeEvent } from '@models/GameModeEvent';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

const NEXT_ROUND_DELAY_MS =
  process.env.NODE_ENV === 'development' ? 1000 : 10 * 1000; // 10s
export interface IColumnCapture {
  playerId?: number;
}

type ConquestGameModeState = {
  columnCaptures: IColumnCapture[];
  isWaitingForNextRound: boolean; // TODO: move to simulation
  nextRoundTimeRemaining: number;
};

export class ConquestGameMode implements IGameMode<ConquestGameModeState> {
  private _columnCaptures: IColumnCapture[];
  private _simulation: ISimulation;
  private _lastCalculationTime: number;
  private _isWaitingForNextRound: boolean; // TODO: move to simulation
  private _lastRoundWinner?: IPlayer; // TODO: move to simulation
  private _nextRoundTime: number; // TODO: move to simulation
  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._columnCaptures = [];
    this._lastCalculationTime = 0;
    this._isWaitingForNextRound = false;
    this._nextRoundTime = 0;
    this._waitForNextRound();
  }

  get lastWinner(): IPlayer | undefined {
    return this._lastRoundWinner;
  }

  get columnCaptures(): IColumnCapture[] {
    return this._columnCaptures;
  }

  get nextRoundTime(): number {
    return this._nextRoundTime;
  }

  get isWaitingForNextRound(): boolean {
    return this._isWaitingForNextRound;
  }

  step(): void {
    const now = Date.now();
    // TODO: find a simple way to sync rather than having to send all column data each frame
    // can client scores be slightly off and still function correctly? (this could get out of sync if events are based on score)
    if (
      /*this._simulation.isNetworkClient || */ now - this._lastCalculationTime <
      1000
    ) {
      return;
    }
    this._lastCalculationTime = now;

    const activePlayers = this._simulation.players.filter(
      (player) => !player.isSpectating
    );

    if (activePlayers.length < 2) {
      this._isWaitingForNextRound = true;
    }

    // TODO: move all this logic into the simulation
    if (this._isWaitingForNextRound) {
      for (const player of activePlayers) {
        if (
          player !== this._lastRoundWinner &&
          !this._simulation.isNetworkClient
        ) {
          player.isSpectating = true;
        }
      }
      if (this._simulation.players.length < 2) {
        this._waitForNextRound();
      } else if (
        Date.now() > this._nextRoundTime &&
        !this._simulation.isNetworkClient
      ) {
        this._simulation.startNextRound();
      }
      return;
    }
    if (activePlayers.length === 1) {
      if (this._simulation.players.length > 1) {
        this._lastRoundWinner = activePlayers[0];
      }
      this._waitForNextRound();
      return;
    }

    const healthChangeSpeed =
      (1 + this._simulation.currentRoundDuration / 10000) *
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
          // TODO: need a separate variable for out of the current game
          player.isSpectating = true;
          //player.knockedOut = true;
        }
      }
    }
  }

  onSimulationInit(simulation: ISimulation): void {}
  onSimulationStep(simulation: ISimulation): void {}
  onPlayerCreated(player: IPlayer): void {}
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
  onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void {}
  onPlayerToggleSpectating(player: IPlayer): void {
    if (player.isSpectating) {
      this._removePlayer(player);
    }
  }

  onBlockCreated(block: IBlock): void {}
  onBlockCreateFailed(block: IBlock): void {}
  onBlockPlaced(block: IBlock): void {
    this._checkColumns();
  }
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number): void {}
  onBlockDropped(block: IBlock): void {}
  onBlockDied(block: IBlock): void {
    block.player.health = Math.max(block.player.health - 0.2, 0);
  }
  onBlockDestroyed(block: IBlock): void {}
  onLineClear(row: number): void {}
  onLineClearing() {}
  onClearLines(): void {}
  onLinesCleared(): void {
    this._checkColumns();
  }
  onGridReset(grid: IGrid): void {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
  onCellIsEmptyChanged(cell: ICell): void {}

  onSimulationNextRound() {
    this._columnCaptures = [...new Array(this._simulation.grid.numColumns)].map(
      () => ({})
    );
    this._lastCalculationTime = 0;
    for (const player of this._simulation.players) {
      player.removeBlock();
      player.isSpectating = false;
      player.health = 1;
      player.score = 0;
      player.estimatedSpawnDelay = 0;
    }
    this._isWaitingForNextRound = false;
    this._simulation.grid.reset();
  }

  private _waitForNextRound() {
    this._isWaitingForNextRound = true;
    this._nextRoundTime = Date.now() + NEXT_ROUND_DELAY_MS;
  }

  private _checkColumns() {
    for (let c = 0; c < this._simulation.grid.numColumns; c++) {
      const cell =
        this._simulation.grid.cells[this._simulation.grid.numRows - 1][c];
      if (cell.player?.id != this._columnCaptures[c].playerId) {
        this._columnCaptures[c].playerId = cell.player?.id;
        if (cell.player) {
          cell.player.health = Math.min(cell.player.health + 0.1, 2);
        }
        this._simulation.onGameModeEvent({
          type: 'conquest-columnChanged',
          column: cell.column,
        });
      }
    }
  }

  onPlayerScoreChanged(player: IPlayer, amount: number): void {}
  onPlayerHealthChanged(player: IPlayer, amount: number): void {}
  onGameModeEvent(event: GameModeEvent): void {}

  getCurrentState(): ConquestGameModeState {
    return {
      isWaitingForNextRound: this._isWaitingForNextRound,
      nextRoundTimeRemaining: this._nextRoundTime - Date.now(),
      columnCaptures: this._columnCaptures,
    };
  }

  loadState(state: ConquestGameModeState) {
    this._isWaitingForNextRound = state.isWaitingForNextRound;
    this._nextRoundTime = Date.now() + state.nextRoundTimeRemaining;
    this._columnCaptures = state.columnCaptures;
  }
}
