import IServerSocketEventListener from './IServerSocketEventListener';
import { IJoinRoomResponse } from '@core/networking/server/IJoinRoomResponse';
import IPlayerConnectedEvent from '@core/networking/server/IPlayerConnectedEvent';
import IPlayerDisconnectedEvent from '@core/networking/server/IPlayerDisconnectedEvent';
import { IBlockCreatedEvent } from '@core/networking/server/IBlockCreatedEvent';

export type ServerMessage =
  | IJoinRoomResponse
  | IPlayerConnectedEvent
  | IPlayerDisconnectedEvent
  | IBlockCreatedEvent;

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
  sendMessage(message: ServerMessage, ...socketIds: number[]): void;
}
