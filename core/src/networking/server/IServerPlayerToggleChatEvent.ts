import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerPlayerToggleChatEvent extends IServerMessage {
  playerId: number;
  isChatting: boolean;
}
