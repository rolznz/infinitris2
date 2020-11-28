import IServerMessage from '@core/networking/server/IServerMessage';
import IClientSocketEventListener from './IClientSocketEventListener';
import IClientSocket, { ValidClientMessage } from './IClientSocket';

export default class ClientSocket implements IClientSocket {
  private _socket: WebSocket;
  private _eventListeners: IClientSocketEventListener[];
  constructor(url: string, eventListeners: IClientSocketEventListener[]) {
    this._eventListeners = eventListeners.filter((listener) => listener);
    this._socket = new WebSocket(url);
    this._socket.onopen = this._onConnect;
    this._socket.onclose = this._onDisconnect;
    this._socket.onmessage = this._onMessage;
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
  disconnect() {
    this._socket.close();
  }

  /**
   * @inheritdoc
   */
  sendMessage(message: ValidClientMessage) {
    this._socket.send(JSON.stringify(message));
  }

  private _onConnect = () => {
    this._eventListeners.forEach((listener) => listener.onConnect());
  };

  private _onDisconnect = () => {
    this._eventListeners.forEach((listener) => listener.onDisconnect());
  };

  private _onMessage = (event: MessageEvent) => {
    const serverMessage: IServerMessage = JSON.parse(event.data);
    this._eventListeners.forEach((listener) =>
      listener.onMessage(serverMessage)
    );
  };
}
