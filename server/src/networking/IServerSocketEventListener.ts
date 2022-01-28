import { IClientMessage } from '@models/networking/client/IClientMessage';
import IClientSocket from './IClientSocket';

export default interface IServerSocketEventListener {
  /**
   * Triggered when a new client connects.
   *
   * @param socket the connection to the client.
   */
  onClientConnect(socket: IClientSocket): void;

  /**
   * Triggered when an existing client disconnects.
   * @param socket the connection to the client.
   */
  onClientDisconnect(socket: IClientSocket): void;

  /**
   * Triggered when the client sends a message to the server.
   *
   * @param socket the connection to the client.
   * @param message the message sent by the client.
   */
  onClientMessage(socket: IClientSocket, message: IClientMessage): void;
}
