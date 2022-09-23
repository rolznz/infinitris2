import { IClientMessage } from '@models/networking/client/IClientMessage';

export default interface IClientToggleChatEvent extends IClientMessage {
  isChatting: boolean;
}
