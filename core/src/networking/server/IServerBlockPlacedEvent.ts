import { NetworkBlockInfo } from '@models/IBlock';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerBlockPlacedEvent extends IServerMessage {
  blockInfo: Pick<NetworkBlockInfo, 'column' | 'row' | 'rotation' | 'playerId'>;
}
