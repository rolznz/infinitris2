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
  get hasHealthbars(): boolean {
    return true;
  }

  step(): void {}

  serialize(): RaceGameModeState {
    return {};
  }
  deserialize(state: RaceGameModeState) {}

  onPlayerScoreChanged(player: IPlayer) {
    const activePlayers = this._simulation.players.filter(
      (otherPlayer) => otherPlayer.status === PlayerStatus.ingame
    );
    const highestPlayerScore =
      activePlayers
        .map((player) => player.score)
        .find((score) => !activePlayers.some((other) => other.score > score)) ||
      0;
    const withGrace = (score: number) => Math.max(score - 200, 0);
    const highestPlayerScoreWithGrace = withGrace(highestPlayerScore);
    const deathScore = highestPlayerScoreWithGrace - 200;

    for (const activePlayer of activePlayers) {
      activePlayer.health =
        Math.max(withGrace(activePlayer.score) - deathScore, 0) /
        (highestPlayerScoreWithGrace - deathScore);
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
}
