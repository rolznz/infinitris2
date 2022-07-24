import { PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import Player from './Player';

export default class NetworkPlayer extends Player {
  private _socketId: number;
  private _isBot: boolean;
  constructor(
    socketId: number,
    simulation: ISimulation,
    playerId: number,
    status: PlayerStatus,
    isBot: boolean,
    nickname: string | undefined,
    color: number | undefined,
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
    this._socketId = socketId;
    this._isBot = isBot;
  }

  get isNetworked() {
    return true;
  }

  get isBot(): boolean {
    return this._isBot;
  }

  get socketId(): number {
    return this._socketId;
  }
}
