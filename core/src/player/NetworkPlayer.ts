import IBlockEventListener from '@models/IBlockEventListener';
import Player from './Player';

export default class NetworkPlayer extends Player {
  constructor(playerId: number, eventListener: IBlockEventListener) {
    super(playerId, eventListener);
  }
}
