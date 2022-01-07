import { NetworkPlayerInfo } from '@models/IPlayer';
import IServerMessage from './IServerMessage';

export default interface IPlayerConnectedEvent extends IServerMessage {
  playerInfo: NetworkPlayerInfo;
}
