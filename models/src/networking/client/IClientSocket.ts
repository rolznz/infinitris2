import { IClientSocketEventListener } from '@models/networking/client/IClientSocketEventListener';
import { IClientMessage } from '@models/networking/client/IClientMessage';

export interface IClientSocket {
  /**
   * Adds a new listener which will receive events when the client connects, disconnects and receives messages.
   *
   * @param eventListener the listener to add.
   */
  addEventListener(eventListener: IClientSocketEventListener): void;

  /**
   * Sends a message to the server.
   * @param message the message to send.
   */
  sendMessage(message: IClientMessage): void;

  /**
   * Closes this socket's connection to the server.
   */
  disconnect(): void;
}
