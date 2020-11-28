import Player from './Player';
import IBlockEventListener from '../block/IBlockEventListener';

export default class NetworkPlayer extends Player {
  constructor(playerId: number, eventListener: IBlockEventListener) {
    super(playerId, eventListener);
  }
}
