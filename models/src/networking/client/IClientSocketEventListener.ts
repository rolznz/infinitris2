import { IClientSocket } from '@models/networking/client/IClientSocket';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IClientSocketEventListener {
  /**
   * Triggered when the client first connects to the server.
   */
  onConnect(socket: IClientSocket): void;

  /**
   * Triggered when the client is disconnected from the server.
   *
   * This may occur if:
   * - there is a network issue
   * - the client was banned from the server
   */
  onDisconnect(): void;

  /**
   * Triggered when the client receives a message from the server
   * @param message the received message
   */
  onMessage(message: IServerMessage): void;
}
