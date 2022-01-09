import IServerSocketEventListener from './IServerSocketEventListener';
import { IServerJoinRoomResponse } from '@core/networking/server/IServerJoinRoomResponse';
import IServerPlayerConnectedEvent from '@core/networking/server/IServerPlayerConnectedEvent';
import IServerPlayerDisconnectedEvent from '@core/networking/server/IServerPlayerDisconnectedEvent';
import { IServerBlockCreatedEvent } from '@core/networking/server/IServerBlockCreatedEvent';
import IServerBlockMovedEvent from '@core/networking/server/IServerBlockMovedEvent';
import { IServerBlockPlacedEvent } from '@core/networking/server/IServerBlockPlacedEvent';
import { IServerNextDayEvent } from '@core/networking/server/IServerNextDayEvent';

export type ServerMessage =
  | IServerJoinRoomResponse
  | IServerPlayerConnectedEvent
  | IServerPlayerDisconnectedEvent
  | IServerBlockCreatedEvent
  | IServerBlockMovedEvent
  | IServerBlockPlacedEvent
  | IServerNextDayEvent;

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
