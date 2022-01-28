import { NetworkBlockInfo } from '@models/IBlock';
import { IClientMessage } from '@models/networking/client/IClientMessage';

export interface IClientBlockDroppedEvent extends IClientMessage {
  data: Pick<NetworkBlockInfo, 'blockId'>;
}
