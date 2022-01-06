import { NetworkBlockInfo } from '@models/IBlock';
import IServerMessage from './IServerMessage';

export interface IBlockCreatedEvent extends IServerMessage {
  blockInfo: NetworkBlockInfo;
}
