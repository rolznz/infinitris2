require('dotenv').config();
import ServerSocket from './networking/ServerSocket';
import Room from './Room';
import IServerSocketEventListener from './networking/IServerSocketEventListener';
import IClientMessage from '@core/networking/client/IClientMessage';
import IClientSocket from './networking/IClientSocket';
import ClientMessageType from '@core/networking/client/ClientMessageType';
import IServerSocket from './networking/IServerSocket';

export default class Server implements IServerSocketEventListener {
  private _socket: IServerSocket;
  private _rooms: { [id: number]: Room };

  constructor(socket: IServerSocket) {
    this._socket = socket;
    this._socket.addEventListener(this);
    this._rooms = {};
    this._rooms[0] = new Room(this._socket.sendMessage.bind(this._socket));
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
    console.log('Received message from client ' + socket.id + ':', message);
    if (socket.roomId === undefined) {
      if (message.type === ClientMessageType.JOIN_ROOM_REQUEST) {
        // TODO: handle full/wrong password/room ID
        socket.roomId = 0;
        this._rooms[socket.roomId].addPlayer(socket.id);
        console.log('Client ' + socket.id + ' joined room ' + socket.roomId);
      } else {
        console.error(
          'Unsupported message received from ' + socket.id + ': ' + message.type
        );
      }
    } else if (socket.roomId) {
      this._rooms[socket.roomId].onClientMessage(socket.id, message);
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
