import { IPlayer, PlayerStatus } from '@models/IPlayer';
import { IRound, NetworkRoundInfo } from '@models/IRound';
import { IRoundEventListener } from '@models/IRoundEventListener';
import ISimulation from '@models/ISimulation';

const NEXT_ROUND_DELAY_MS = __DEV__ ? 1000 : 10000; // 10s

export class Round implements IRound {
  private _simulation: ISimulation;
  private _isWaitingForNextRound: boolean;
  private _nextRoundStartTime: number;
  private _winner?: IPlayer;
  private _currentRoundStartTime: number;
  private _eventListener: IRoundEventListener;
  private _prevConditionsMet: boolean;

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._eventListener = simulation;
    this._isWaitingForNextRound = true;
    this._nextRoundStartTime = 0;
    this._currentRoundStartTime = 0;
    this._prevConditionsMet = false;
    this.end(undefined);
  }

  get currentRoundStartTime(): number {
    return this._currentRoundStartTime;
  }
  set currentRoundStartTime(currentRoundStartTime: number) {
    this._currentRoundStartTime = currentRoundStartTime;
  }

  get currentRoundDuration(): number {
    return Date.now() - this._currentRoundStartTime;
  }

  get winner(): IPlayer | undefined {
    return this._winner;
  }

  get nextRoundTime(): number {
    return this._nextRoundStartTime;
  }

  get isWaitingForNextRound(): boolean {
    return this._isWaitingForNextRound;
  }

  get conditionsAreMet(): boolean {
    return (
      this._simulation.nonSpectatorPlayers.length > 1 &&
      this._simulation.isRunning
    );
  }

  step() {
    if (this._simulation.isNetworkClient) {
      return;
    }

    if (this._isWaitingForNextRound) {
      if (!this._prevConditionsMet && this.conditionsAreMet) {
        this.restartNextRoundTimer();
      }
      this._prevConditionsMet = this.conditionsAreMet;
      if (this.conditionsAreMet && Date.now() > this._nextRoundStartTime) {
        this.start();
      }
    } else {
      const activePlayers = this._simulation.players.filter(
        (player) => player.status === PlayerStatus.ingame
      );
      if (activePlayers.length <= 1) {
        this.end(activePlayers[0]);
      }
    }
  }

  start() {
    console.log('START NEXT ROUND');
    this._currentRoundStartTime = Date.now();
    this._isWaitingForNextRound = false;
    this._winner = undefined;
    this._eventListener.onNextRound(this._simulation);

    for (const player of this._simulation.players) {
      if (
        player.status === PlayerStatus.ingame ||
        player.status === PlayerStatus.knockedOut
      ) {
        player.removeBlock();
        player.status = PlayerStatus.ingame;
        player.health =
          this._simulation.settings.gameModeType === 'column-conquest'
            ? 0.5
            : 1; // TODO: add initial health to game mode
        player.score = 0;
        player.estimatedSpawnDelay = 0;
      }
    }
    this._simulation.grid.reset();
  }

  end(winner: IPlayer | undefined) {
    console.log('END ROUND - winner = ' + winner?.nickname);
    this._winner = winner;
    for (const player of this._simulation.players) {
      if (
        player.status === PlayerStatus.ingame /* && player !== this._winner*/
      ) {
        player.status = PlayerStatus.knockedOut;
      }
    }
    this._isWaitingForNextRound = true;
    this.restartNextRoundTimer();
    this._eventListener.onEndRound(this._simulation);
  }

  restartNextRoundTimer() {
    console.log('START NEXT ROUND TIMER');
    this._nextRoundStartTime = Date.now() + NEXT_ROUND_DELAY_MS;
    this._eventListener.onStartNextRoundTimer(this._simulation);
  }

  public serialize(): NetworkRoundInfo {
    return {
      isWaitingForNextRound: this._isWaitingForNextRound,
      nextRoundTimeRemaining: this._nextRoundStartTime - Date.now(),
      currentRoundDuration: this.currentRoundDuration,
      winnerId: this._winner?.id,
    };
  }

  public deserialize(state: NetworkRoundInfo) {
    this._isWaitingForNextRound = state.isWaitingForNextRound;
    this._nextRoundStartTime = Date.now() + state.nextRoundTimeRemaining;
    this._currentRoundStartTime = Date.now() - state.currentRoundDuration;
    this._winner =
      state.winnerId !== undefined
        ? this._simulation.getPlayer(state.winnerId)
        : undefined;
  }
}
