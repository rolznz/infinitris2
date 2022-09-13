import { getScoreBasedFallDelay } from '@core/gameModes/InfinityGameMode';
import { IGameMode } from '@models/IGameMode';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import { getKnockoutPointDifference } from '@models/SimulationSettings';

type RaceGameModeState = {};
export class RaceGameMode implements IGameMode<RaceGameModeState> {
  private _simulation: ISimulation;

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
  }
  get hasRounds(): boolean {
    return true;
  }
  get hasHealthbars(): boolean {
    return true;
  }

  get hasLineClearReward(): boolean {
    return true;
  }
  get hasBlockPlacementReward(): boolean {
    return true;
  }
  get shouldNewPlayerSpectate(): boolean {
    return true;
  }

  step(): void {}

  serialize(): RaceGameModeState {
    return {};
  }
  deserialize(state: RaceGameModeState) {}

  onPlayerScoreChanged(player: IPlayer) {
    const activePlayers = this._simulation.activePlayers;
    const highestPlayerScore =
      activePlayers
        .map((player) => player.score)
        .find((score) => !activePlayers.some((other) => other.score > score)) ||
      0;
    const deathScore =
      highestPlayerScore -
      getKnockoutPointDifference(this._simulation.settings);

    for (const activePlayer of activePlayers) {
      activePlayer.health =
        Math.max(activePlayer.score - deathScore, 0) /
        (highestPlayerScore - deathScore);
      console.log(
        'Set player ' + activePlayer.id + ' health ' + activePlayer.health
      );
    }
    if (this._simulation.isNetworkClient) {
      return;
    }

    // kick out slowest players

    for (const otherPlayer of activePlayers) {
      if (otherPlayer.score < deathScore) {
        otherPlayer.status = PlayerStatus.knockedOut;
      }
    }
  }

  getFallDelay(player: IPlayer) {
    return getScoreBasedFallDelay(player);
  }
}
