import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerBlockDroppedEvent extends IServerMessage {
  playerId: number;
}
