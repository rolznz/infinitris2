import * as WebSocket from 'ws';
import IClientMessage from '@core/networking/client/IClientMessage';
import IServerSocketEventListener from './IServerSocketEventListener';
import { Server as WebSocketServer, Data as WebSocketData } from 'ws';
import IClientSocket from './IClientSocket';
import IServerSocket, { ServerMessage } from './IServerSocket';

const HEARTBEAT_TIMEOUT = 30000;

export type SendServerMessageFunction = (
  message: ServerMessage,
  ...socketIds: number[]
) => void;

interface ISocketWrapper extends WebSocket, IClientSocket {
  isAlive: boolean;
}

export default class ServerSocket implements IServerSocket {
  private _sockets: { [id: number]: ISocketWrapper };
  private _nextSocketId: number;
  private _socketServer: WebSocketServer;
  private _eventListeners: IServerSocketEventListener[];
  constructor(host: string, port: number) {
    this._nextSocketId = 0;
    this._sockets = {};
    this._socketServer = new WebSocketServer({ host, port });
    this._socketServer.on('connection', this._onClientConnect);
    this._eventListeners = [];
  }

  /**
   * @inheritdoc
   */
  addEventListener(eventListener: IServerSocketEventListener) {
    this._eventListeners.push(eventListener);
  }

  /**
   * @inheritdoc
   */
  sendMessage(message: ServerMessage, ...socketIds: number[]) {
    socketIds.forEach((socketId) => {
      const socket: ISocketWrapper | null = this._sockets[socketId];
      if (socket) {
        socket.send(JSON.stringify(message));
      }
    });
  }

  private _onClientConnect = (socket: ISocketWrapper) => {
    socket.id = this._nextSocketId++;
    this._sockets[socket.id] = socket;

    const heartbeat = () => (socket.isAlive = true);
    heartbeat();

    const checkHeartbeat = setInterval(() => {
      if (!socket.isAlive) {
        this._onClientDisconnect(socket, checkHeartbeat);
      } else {
        socket.isAlive = false;
        socket.ping();
      }
    }, HEARTBEAT_TIMEOUT);

    socket.on('close', () => this._onClientDisconnect(socket, checkHeartbeat));
    socket.on('message', (message) => this._onClientMessage(socket, message));
    socket.on('pong', () => heartbeat());

    this._eventListeners.forEach((listener) =>
      listener.onClientConnect(socket)
    );
  };

  private _onClientDisconnect = (
    socket: ISocketWrapper,
    checkHeartbeat: NodeJS.Timeout
  ) => {
    this._eventListeners.forEach((listener) =>
      listener.onClientDisconnect(socket)
    );
    clearInterval(checkHeartbeat);
    delete this._sockets[socket.id];
    socket.terminate();
  };

  private _onClientMessage = (socket: ISocketWrapper, event: WebSocketData) => {
    const message: IClientMessage = JSON.parse(event as string);
    this._eventListeners.forEach((listener) =>
      listener.onClientMessage(socket, message)
    );
  };
}
