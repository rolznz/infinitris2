import { NetworkBlockInfo } from '@models/IBlock';
import IClientMessage from './IClientMessage';

export interface IClientBlockMovedEvent extends IClientMessage {
  data: Pick<NetworkBlockInfo, 'column' | 'row' | 'rotation'>;
}
