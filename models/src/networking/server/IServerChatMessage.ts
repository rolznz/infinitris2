import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerChatMessage extends IServerMessage {
  message: string;
  playerId: number;
}
