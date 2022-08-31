import { INITIAL_FALL_DELAY } from '@core/block/Block';
import { IGameMode } from '@models/IGameMode';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type InfinityGameModeState = {};

const FALL_SPEED_SCORE_EXP = 0.55;
export const MAX_SCORE = Math.pow(INITIAL_FALL_DELAY, 1 / FALL_SPEED_SCORE_EXP);
export class InfinityGameMode implements IGameMode<InfinityGameModeState> {
  private _simulation: ISimulation;
  constructor(simulation: ISimulation) {
    this._simulation = simulation;
  }
  step(): void {}

  serialize(): InfinityGameModeState {
    return {};
  }
  deserialize(state: InfinityGameModeState) {}

  get hasRounds(): boolean {
    return false;
  }
  get hasHealthbars(): boolean {
    return false;
  }
  get hasLineClearReward(): boolean {
    return true;
  }

  getFallDelay(player: IPlayer) {
    return getScoreBasedFallDelay(player);
  }

  getSpawnDelay(player: IPlayer) {
    const highestPlayerScore = Math.max(
      ...this._simulation.players.map((player) => player.score)
    );

    // apply a grace period to the score, to stop players who make a mistake at the start of the game from being unfairly penalized
    const scoreGraceAmount =
      this._simulation.settings.spawnDelayScoreGraceAmount ?? 250;
    const getScoreWithGrace = (score: number) =>
      Math.min(
        Math.max(score - scoreGraceAmount, 0),
        this._simulation.settings.spawnDelayMaxScore ?? 1000
      );

    // max out the score to reach so it's possible for players to catch up
    const scoreDiffWithGrace =
      getScoreWithGrace(highestPlayerScore) - getScoreWithGrace(player.score);
    return (
      (scoreDiffWithGrace *
        ((this._simulation.settings.maxSpawnDelaySeconds ?? 5) * 1000)) /
      MAX_SCORE
    );
  }
}

export function getScoreBasedFallDelay(player: IPlayer) {
  return (
    INITIAL_FALL_DELAY -
    Math.pow(Math.min(player.score, MAX_SCORE), FALL_SPEED_SCORE_EXP)
  );
}
