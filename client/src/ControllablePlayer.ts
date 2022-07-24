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
    characterId?: string,
    isPremium?: boolean,
    isNicknameVerified?: boolean
  ) {
    super(
      simulation,
      playerId,
      status,
      nickname,
      color,
      patternFilename,
      characterId,
      isPremium,
      isNicknameVerified
    );
  }

  get isControllable(): boolean {
    return true;
  }
}
