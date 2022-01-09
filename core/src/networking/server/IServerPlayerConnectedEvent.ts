import { NetworkPlayerInfo } from '@models/IPlayer';
import IServerMessage from './IServerMessage';

export default interface IServerPlayerConnectedEvent extends IServerMessage {
  playerInfo: Omit<NetworkPlayerInfo, 'score'>;
}
