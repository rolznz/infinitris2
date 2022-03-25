import { PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import Player from './Player';

export default class NetworkPlayer extends Player {
  private _socketId: number;
  constructor(
    socketId: number,
    simulation: ISimulation,
    playerId: number,
    status: PlayerStatus,
    nickname: string | undefined,
    color: number | undefined,
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
    this._socketId = socketId;
  }

  get isNetworked() {
    return true;
  }

  get socketId(): number {
    return this._socketId;
  }
}
