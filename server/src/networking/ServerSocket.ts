import IServerSocketEventListener from './IServerSocketEventListener';
import WebSocket, {
  Server as WebSocketServer,
  Data as WebSocketData,
} from 'ws';

import IServerSocket from './IServerSocket';
import { IClientMessage } from '@models/networking/client/IClientMessage';
import { IServerMessage } from '@models/networking/server/IServerMessage';
import IClientSocket from '@src/networking/IClientSocket';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';

const HEARTBEAT_TIMEOUT = 30000;
const AFK_TIMEOUT = 10 * 60000;

interface ISocketWrapper extends WebSocket, IClientSocket {
  isAlive: boolean;
  lastMovement: number;
  messageId: number;
}

type ServerSocketMap = { [id: number]: ISocketWrapper };

export type SendServerMessageFunction = (
  message: IServerMessage,
  ...socketIds: number[]
) => void;

export default class ServerSocket implements IServerSocket {
  private _sockets: ServerSocketMap;
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

  /*get sockets(): ServerSocketMap {
    return this._sockets;
  }*/

  /**
   * @inheritdoc
   */
  addEventListener(eventListener: IServerSocketEventListener) {
    this._eventListeners.push(eventListener);
  }

  /**
   * @inheritdoc
   */
  sendMessage(message: IServerMessage, ...socketIds: number[]) {
    socketIds.forEach((socketId) => {
      const socket: ISocketWrapper | null = this._sockets[socketId];
      if (socket) {
        socket.send(
          JSON.stringify({ ...message, messageId: socket.messageId })
        );
        ++socket.messageId;
      }
    });
  }

  private _onClientConnect = (socket: ISocketWrapper) => {
    socket.id = this._nextSocketId++;
    socket.messageId = 0;
    socket.isAlive = true;
    socket.lastMovement = Date.now();
    this._sockets[socket.id] = socket;

    const heartbeat = () => (socket.isAlive = true);

    const checkHeartbeat = setInterval(() => {
      if (!socket.isAlive || Date.now() - socket.lastMovement > AFK_TIMEOUT) {
        console.log(
          'Closed client socket ',
          socket.id,
          'Reason',
          !socket.isAlive ? 'Heartbeat timeout' : 'No recent activity'
        );
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
    if (message.type === ClientMessageType.BLOCK_MOVED) {
      socket.lastMovement = Date.now();
    }
    this._eventListeners.forEach((listener) =>
      listener.onClientMessage(socket, message)
    );
  };
}
