import { NetworkPlayerInfo } from '@models/IPlayer';
import { IClientMessage } from '@models/networking/client/IClientMessage';

export default interface IClientJoinRoomRequest extends IClientMessage {
  roomIndex: number;
  player?: Partial<NetworkPlayerInfo>;
  networkVersion: number;
}
