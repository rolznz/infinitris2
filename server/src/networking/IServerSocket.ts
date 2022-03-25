import IServerSocketEventListener from './IServerSocketEventListener';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export default interface IServerSocket {
  /**
   * Adds a new listener which will receive events when a client connects, disconnects and sends messages.
   *
   * @param eventListener the listener to add.
   */
  addEventListener(eventListener: IServerSocketEventListener): void;

  /**
   * Sends a message to one or more clients by their socket ids.
   *
   * @param message the message to send to the clients.
   * @param socketIds a list of client socket ids.
   */
  sendMessage(message: IServerMessage, ...socketIds: number[]): void;

  //get sockets(): ServerSocketMap;
}
