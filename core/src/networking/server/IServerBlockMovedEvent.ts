import { NetworkBlockInfo } from '@models/IBlock';
import IServerMessage from './IServerMessage';

export default interface IServerBlockMovedEvent extends IServerMessage {
  blockInfo: Pick<NetworkBlockInfo, 'column' | 'row' | 'rotation' | 'playerId'>;
}