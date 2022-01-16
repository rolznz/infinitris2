import { NetworkBlockInfo } from '@models/IBlock';
import IClientMessage from './IClientMessage';

export interface IClientBlockDroppedEvent extends IClientMessage {
  data: Pick<NetworkBlockInfo, 'blockId'>;
}
