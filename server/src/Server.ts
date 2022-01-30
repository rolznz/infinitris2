require('dotenv').config();
import ServerSocket from './networking/ServerSocket';
import Room from './Room';
import IServerSocketEventListener from './networking/IServerSocketEventListener';
import IClientSocket from './networking/IClientSocket';
import IServerSocket from './networking/IServerSocket';
import { IClientMessage } from '@models/networking/client/IClientMessage';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';
import IClientJoinRoomRequest from '@core/networking/client/IClientJoinRoomRequest';

export default class Server implements IServerSocketEventListener {
  private _socket: IServerSocket;
  private _rooms: { [id: number]: Room };

  constructor(socket: IServerSocket) {
    this._socket = socket;
    this._socket.addEventListener(this);
    this._rooms = {};
    const sendServerMessage = this._socket.sendMessage.bind(this._socket);
    this._rooms[0] = new Room(sendServerMessage, 'infinity');
    this._rooms[1] = new Room(sendServerMessage, 'conquest');
  }

  /**
   * Retrieves the rooms currently running within the server.
   */
  get rooms(): { [id: number]: Room } {
    return this._rooms;
  }

  /**
   * @inheritdoc
   */
  onClientConnect(socket: IClientSocket) {
    console.log('Client ' + socket.id + ' connected');
  }

  /**
   * @inheritdoc
   */
  onClientDisconnect(socket: IClientSocket) {
    console.log('Client ' + socket.id + ' disconnected');
    if (socket.roomId !== undefined) {
      this._rooms[socket.roomId].removePlayer(socket.id);
    }
  }

  /**
   * @inheritdoc
   */
  onClientMessage(socket: IClientSocket, message: IClientMessage) {
    console.log(
      'Received message from client ' + socket.id + ':',
      message + ' room: ' + socket.roomId
    );
    try {
      if (socket.roomId === undefined) {
        if (message.type === ClientMessageType.JOIN_ROOM_REQUEST) {
          // TODO: handle and validate full/wrong password/room ID
          const joinRoomRequest = message as IClientJoinRoomRequest;
          socket.roomId = joinRoomRequest.roomId || 0;
          this._rooms[socket.roomId].addPlayer(socket.id);
          console.log('Client ' + socket.id + ' joined room ' + socket.roomId);
        } else {
          console.error(
            'Unsupported message received from ' +
              socket.id +
              ': ' +
              message.type
          );
        }
      } else if (socket.roomId !== undefined) {
        this._rooms[socket.roomId].onClientMessage(socket.id, message);
      }
    } catch (error) {
      console.error(
        'Error in onClientMessage(' + socket.id + ')',
        message,
        error
      );
    }
  }
}

// entry point
if (process.argv[process.argv.length - 1] === 'launch') {
  (() => {
    if (!process.env.HOST || !process.env.PORT) {
      throw new Error('HOST or PORT not specified in .env');
    }
    console.log(`Starting server at ${process.env.HOST}:${process.env.PORT}`);
    new Server(new ServerSocket(process.env.HOST, parseInt(process.env.PORT)));
  })();
}
