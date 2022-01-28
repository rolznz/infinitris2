import { NetworkBlockInfo } from '@models/IBlock';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export default interface IServerBlockMovedEvent extends IServerMessage {
  blockInfo: Pick<NetworkBlockInfo, 'column' | 'row' | 'rotation' | 'playerId'>;
}
