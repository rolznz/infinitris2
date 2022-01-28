import { NetworkPlayerInfo } from '@models/IPlayer';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export default interface IServerPlayerConnectedEvent extends IServerMessage {
  playerInfo: Omit<NetworkPlayerInfo, 'score'>;
}
