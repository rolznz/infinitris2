import { NetworkBlockInfo } from '@models/IBlock';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerBlockCreatedEvent extends IServerMessage {
  blockInfo: NetworkBlockInfo;
}
