import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import { IGameMode } from '@models/IGameMode';
import IGrid from '@models/IGrid';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

const NEXT_ROUND_DELAY_MS = 100;
export interface IColumnCapture {
  //column:
  playerId?: number;
  value: number;
  attackerId?: number;
}

type PlayerHealthMap = { [playerId: number]: number };

type ConquestGameModeState = {
  playerHealths: PlayerHealthMap;
  columnCaptures: IColumnCapture[];
  isWaitingForNextRound: boolean;
  nextRoundTimeRemaining: number;
  lastCalculation: number;
};

export class ConquestGameMode implements IGameMode<ConquestGameModeState> {
  private _columnCaptures: IColumnCapture[];
  private _simulation: ISimulation;
  private _lastCalculation: number;
  private _playerHealths: PlayerHealthMap;
  private _isWaitingForNextRound: boolean;
  private _lastWinner?: IPlayer;
  private _nextRoundTime: number;
  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._columnCaptures = [];
    this._lastCalculation = 0;
    this._playerHealths = {};
    this._isWaitingForNextRound = false;
    this._nextRoundTime = 0;
    this._waitForNextRound();
  }

  get lastWinner(): IPlayer | undefined {
    return this._lastWinner;
  }

  get columnCaptures(): IColumnCapture[] {
    return this._columnCaptures;
  }

  get playerHealths(): PlayerHealthMap {
    return this._playerHealths;
  }

  get nextRoundTime(): number {
    return this._nextRoundTime;
  }

  get isWaitingForNextRound(): boolean {
    return this._isWaitingForNextRound;
  }

  step(): void {
    // TODO: find a simple way to sync rather than having to send all column data each frame
    // can client scores be slightly off and still function correctly? (this could get out of sync if events are based on score)
    if (
      /*this._simulation.isNetworkClient || */ ++this._lastCalculation < 100
    ) {
      return;
    }
    this._lastCalculation = 0;

    const activePlayers = this._simulation.players.filter(
      (player) => !player.isSpectating
    );

    if (activePlayers.length < 2) {
      this._isWaitingForNextRound = true;
    }

    if (this._isWaitingForNextRound) {
      for (const player of activePlayers) {
        if (player !== this._lastWinner && !this._simulation.isNetworkClient) {
          player.isSpectating = true;
        }
      }
      if (this._simulation.players.length < 2) {
        this._waitForNextRound();
      } else if (
        Date.now() > this._nextRoundTime &&
        !this._simulation.isNetworkClient
      ) {
        // TODO: simulation cannot listen to events from game modes, as game modes listen to events from the simulation
        // (this would create infinite recursion)
        // also, we don't want the simulation to have to know about specific game mode events,
        // maybe the simulation should just know about general events, like "rounds"
        this._simulation.startNextRound();
      }
      return;
    }
    if (activePlayers.length === 1) {
      if (this._simulation.players.length > 1) {
        this._lastWinner = activePlayers[0];
      }
      this._waitForNextRound();
      return;
    }

    /*const summedPlayerScores = Math.max(
      activePlayers.length > 1
        ? activePlayers.map((player) => player.score).reduce((a, b) => a + b)
        : 0,
      1
    );*/

    const playerColumnCaptureCounts: { [playerId: number]: number } = {};
    for (let c = 0; c < this._simulation.grid.numColumns; c++) {
      const playerCaptureValues: { [playerId: number]: number } = {};
      for (let r = 0; r < this._simulation.grid.numRows; r++) {
        const cell = this._simulation.grid.cells[r][c];
        if (!cell.isEmpty && cell.player) {
          // TODO: consider lower cells having more weighting
          // give higher capture value for player with high score
          playerCaptureValues[cell.player.id] =
            (playerCaptureValues[cell.player.id] || 0) + 1; // * (cell.player.score / summedPlayerScores);
        }
      }
      const highestPlayerEntry = Object.entries(playerCaptureValues)
        .map((e) => ({ playerId: e[0], value: e[1] }))
        .find(
          (entry, i, array) =>
            !array.some((other, i2) => i !== i2 && other.value >= entry.value)
        );

      if (highestPlayerEntry) {
        const highestPlayer = this._simulation.getPlayer(
          parseInt(highestPlayerEntry.playerId)
        );
        const dominance =
          highestPlayerEntry.value /
          Object.values(playerCaptureValues).reduce((a, b) => a + b);
        // multiply by number of captured cells
        const changeMultiplier = 0.02 * highestPlayerEntry.value;
        this._columnCaptures[c].attackerId = highestPlayer.id;
        if (
          this._columnCaptures[c].playerId !== highestPlayer.id &&
          this._columnCaptures[c].value > 0
        ) {
          this._columnCaptures[c].value = Math.max(
            this._columnCaptures[c].value - dominance * changeMultiplier,
            0
          );
        } else {
          this._columnCaptures[c].value = Math.min(
            this._columnCaptures[c].value + dominance * changeMultiplier,
            1
          );
          if (this._columnCaptures[c].playerId !== highestPlayer.id) {
            this._columnCaptures[c].playerId = highestPlayer.id;
          }
        }
        playerColumnCaptureCounts[highestPlayer.id] =
          (playerColumnCaptureCounts[highestPlayer.id] || 0) + 1;
        highestPlayer.score += 1;
      } else {
        this._columnCaptures[c].attackerId = undefined;
        this._columnCaptures[c].value = Math.max(
          this._columnCaptures[c].value - 0.05,
          0
        );
        if (this._columnCaptures[c].value === 0) {
          this._columnCaptures[c].playerId = undefined;
        }
      }
    }

    if (
      activePlayers.some((player) => playerColumnCaptureCounts[player.id] > 0)
    ) {
      const lowestPlayerCaptureCount = activePlayers
        .map((player) => playerColumnCaptureCounts[player.id] || 0)
        .find(
          (count, _, array) =>
            array.find((other) => other < count) === undefined
        )!;
      const healthChangeSpeed =
        this._simulation.settings.roundLength === 'short'
          ? 0.2
          : this._simulation.settings.roundLength === 'long'
          ? 0.01
          : 0.05;

      for (const player of activePlayers) {
        if (
          (playerColumnCaptureCounts[player.id] || 0) ===
          lowestPlayerCaptureCount
        ) {
          this._playerHealths[player.id] = Math.max(
            this._playerHealths[player.id] - healthChangeSpeed,
            0
          );
          if (this._playerHealths[player.id] === 0) {
            if (!this._simulation.isNetworkClient) {
              // TODO: need a separate variable for out of the current game
              player.isSpectating = true;
              //player.knockedOut = true;
            }
          }
        } else {
          this._playerHealths[player.id] = Math.min(
            this._playerHealths[player.id] + healthChangeSpeed,
            1
          );
        }
      }
    }
  }

  onSimulationInit(simulation: ISimulation): void {}
  onSimulationStep(simulation: ISimulation): void {}
  onSimulationNextDay(simulation: ISimulation): void {}
  onPlayerCreated(player: IPlayer): void {}
  onPlayerDestroyed(player: IPlayer): void {
    this._removePlayer(player);
  }
  private _removePlayer(player: IPlayer) {
    for (let c = 0; c < this._columnCaptures.length; c++) {
      if (this._columnCaptures[c].playerId === player.id) {
        this._columnCaptures[c].attackerId = undefined;
        this._columnCaptures[c].playerId = undefined;
        this._columnCaptures[c].value = 0;
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
  onBlockPlaced(block: IBlock): void {}
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number): void {}
  onBlockDropped(block: IBlock): void {}
  onBlockDied(block: IBlock): void {}
  onBlockDestroyed(block: IBlock): void {}
  onLineCleared(row: number): void {}
  onGridCollapsed(grid: IGrid): void {}
  onGridReset(grid: IGrid): void {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
  onCellIsEmptyChanged(cell: ICell): void {}

  onSimulationNextRound() {
    this._columnCaptures = [...new Array(this._simulation.grid.numColumns)].map(
      () => ({
        value: 0,
      })
    );
    this._lastCalculation = 0;
    this._playerHealths = {};
    for (const player of this._simulation.players) {
      player.removeBlock();
      player.isSpectating = false;
      this._playerHealths[player.id] = 1;
      player.score = 0;
      player.estimatedSpawnDelay = 0;
    }
    this._isWaitingForNextRound = false;
    this._simulation.grid.reset();
    this._simulation.goToNextDay();
  }

  private _waitForNextRound() {
    this._isWaitingForNextRound = true;
    this._nextRoundTime = Date.now() + NEXT_ROUND_DELAY_MS;
  }

  getCurrentState(): ConquestGameModeState {
    return {
      isWaitingForNextRound: this._isWaitingForNextRound,
      nextRoundTimeRemaining: this._nextRoundTime - Date.now(),
      columnCaptures: this._columnCaptures,
      lastCalculation: this._lastCalculation,
      playerHealths: this._playerHealths,
    };
  }

  loadState(state: ConquestGameModeState) {
    this._isWaitingForNextRound = state.isWaitingForNextRound;
    this._nextRoundTime = Date.now() + state.nextRoundTimeRemaining;
    this._columnCaptures = state.columnCaptures;
    this._lastCalculation = state.lastCalculation;
    this._playerHealths = state.playerHealths;
  }
}
