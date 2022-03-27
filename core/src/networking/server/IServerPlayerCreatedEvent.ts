import { NetworkPlayerInfo } from '@models/IPlayer';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export default interface IServerPlayerCreatedEvent extends IServerMessage {
  playerInfo: NetworkPlayerInfo;
}
