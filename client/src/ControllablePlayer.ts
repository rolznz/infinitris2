import Player from '@core/player/Player';
import { PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

export default class ControllablePlayer extends Player {
  constructor(
    simulation: ISimulation,
    playerId: number,
    status: PlayerStatus,
    nickname?: string,
    color?: number,
    patternFilename?: string,
    characterId?: string
  ) {
    super(
      simulation,
      playerId,
      status,
      nickname,
      color,
      patternFilename,
      characterId
    );
  }

  get isControllable(): boolean {
    return true;
  }
}
