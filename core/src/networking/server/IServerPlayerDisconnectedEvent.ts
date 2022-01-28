import { IServerMessage } from '@models/networking/server/IServerMessage';

export default interface IServerPlayerDisconnectedEvent extends IServerMessage {
  playerId: number;
}
