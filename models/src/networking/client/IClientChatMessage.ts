import { IClientMessage } from '@models/networking/client/IClientMessage';

export interface IClientChatMessage extends IClientMessage {
  message: string;
}
