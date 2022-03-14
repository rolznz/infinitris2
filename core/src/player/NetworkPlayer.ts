import IBlockEventListener from '@models/IBlockEventListener';
import ISimulation from '@models/ISimulation';
import Player from './Player';

export default class NetworkPlayer extends Player {
  private _socketId: number;
  constructor(
    socketId: number,
    simulation: ISimulation,
    playerId: number,
    nickname: string | undefined,
    color: number | undefined,
    isSpectating: boolean,
    patternFilename?: string,
    characterId?: string
  ) {
    super(
      simulation,
      playerId,
      nickname,
      color,
      isSpectating,
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
