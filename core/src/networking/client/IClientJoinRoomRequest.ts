import { NetworkPlayerInfo } from '@models/IPlayer';
import { IClientMessage } from '@models/networking/client/IClientMessage';

export default interface IClientJoinRoomRequest extends IClientMessage {
  roomId: number;
  player?: Partial<NetworkPlayerInfo>;
}
