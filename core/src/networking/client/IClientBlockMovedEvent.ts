import { NetworkBlockInfo } from '@models/IBlock';
import { IClientMessage } from '@models/networking/client/IClientMessage';

export interface IClientBlockMovedEvent extends IClientMessage {
  data: Pick<NetworkBlockInfo, 'column' | 'row' | 'rotation' | 'blockId'>;
}
