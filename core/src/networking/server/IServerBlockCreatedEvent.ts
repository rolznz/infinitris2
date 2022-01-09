import { NetworkBlockInfo } from '@models/IBlock';
import IServerMessage from './IServerMessage';

export interface IServerBlockCreatedEvent extends IServerMessage {
  blockInfo: NetworkBlockInfo;
}
