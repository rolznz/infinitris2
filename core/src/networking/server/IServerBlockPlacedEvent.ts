import { NetworkBlockInfo } from '@models/IBlock';
import IServerMessage from './IServerMessage';

export interface IServerBlockPlacedEvent extends IServerMessage {
  blockInfo: Pick<NetworkBlockInfo, 'column' | 'row' | 'rotation' | 'playerId'>;
}
