import IClientSocket from '@server/networking/IClientSocket';
import IClientSocketEventListener from '@client/networking/IClientSocketEventListener';
import FakeServerSocket from './FakeServerSocket';
import { ValidClientMessage } from '@client/networking/IClientSocket';
import IServerMessage from '@core/networking/server/IServerMessage';
import IServerClientSocket from '@server/networking/IClientSocket';

export default class FakeClientSocket
  implements IClientSocket, IClientSocketEventListener, IServerClientSocket {
  id: number;
  roomId: number;

  private _eventListeners: IClientSocketEventListener[];
  private _serverSocket: FakeServerSocket;

  constructor() {
    this._eventListeners = [];
  }

  /**
   * @inheritdoc
   */
  addEventListener(eventListener: IClientSocketEventListener) {
    this._eventListeners.push(eventListener);
  }

  /**
   * @inheritdoc
   */
  sendMessage(message: ValidClientMessage) {
    this._serverSocket.receiveMessage(this, message);
  }

  /**
   * @inheritdoc
   */
  disconnect() {
    throw new Error('Unimplemented');
  }

  /**
   * @inheritdoc
   */
  onConnect() {
    this._eventListeners.forEach((eventListener) => eventListener.onConnect());
  }

  /**
   * @inheritdoc
   */
  onDisconnect() {
    this._eventListeners.forEach((eventListener) =>
      eventListener.onDisconnect()
    );
  }

  /**
   * @inheritdoc
   */
  onMessage(message: IServerMessage) {
    this._eventListeners.forEach((eventListener) =>
      eventListener.onMessage(message)
    );
  }

  /**
   * Simulate the connection to a real server.
   *
   * @param serverSocket the server to connect to.
   */
  connectTo(serverSocket: FakeServerSocket) {
    this._serverSocket = serverSocket;
    this.onConnect();
  }
}
