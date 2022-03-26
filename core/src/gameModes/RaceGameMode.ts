import { IGameMode } from '@models/IGameMode';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type RaceGameModeState = {};
export class RaceGameMode implements IGameMode<RaceGameModeState> {
  private _simulation: ISimulation;

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
  }
  get hasRounds(): boolean {
    return true;
  }

  step(): void {}

  serialize(): RaceGameModeState {
    return {};
  }
  deserialize(state: RaceGameModeState) {}

  onPlayerScoreChanged(player: IPlayer) {
    if (this._simulation.isNetworkClient) {
      return;
    }
    const activePlayers = this._simulation.players.filter(
      (otherPlayer) => otherPlayer.status === PlayerStatus.ingame
    );

    // kick out slowest players
    const highestPlayerScore =
      activePlayers
        .map((player) => player.score)
        .find((score) => !activePlayers.some((other) => other.score > score)) ||
      0;
    const highestPlayerScoreWithGrace = Math.max(highestPlayerScore - 200, 0);

    for (const otherPlayer of activePlayers) {
      if (otherPlayer.score < highestPlayerScoreWithGrace - 200) {
        otherPlayer.status = PlayerStatus.knockedOut;
      }
    }
  }
}
