import { IClientBlockMovedEvent } from '@core/networking/client/IClientBlockMovedEvent';
import IClientJoinRoomRequest from '@core/networking/client/IClientJoinRoomRequest';
import IClientSocketEventListener from './IClientSocketEventListener';

export type ClientMessage = IClientJoinRoomRequest | IClientBlockMovedEvent;

export default interface IClientSocket {
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
  sendMessage(message: ClientMessage): void;

  /**
   * Closes this socket's connection to the server.
   */
  disconnect(): void;
}
