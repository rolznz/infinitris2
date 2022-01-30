import IBlockEventListener from '@models/IBlockEventListener';
import ISimulation from '@models/ISimulation';
import Player from './Player';

export default class NetworkPlayer extends Player {
  constructor(
    simulation: ISimulation,
    playerId: number,
    nickname: string | undefined,
    color: number | undefined,
    isSpectating: boolean
  ) {
    super(simulation, playerId, nickname, color, isSpectating);
  }

  get isNetworked() {
    return true;
  }
}
