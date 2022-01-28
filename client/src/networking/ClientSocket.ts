import { IClientSocketEventListener } from '@models/networking/client/IClientSocketEventListener';
import { IClientSocket } from '@models/networking/client/IClientSocket';
import { IClientMessage } from '@models/networking/client/IClientMessage';
import { IServerMessage } from '@models/networking/server/IServerMessage';

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
  sendMessage(message: IClientMessage) {
    this._socket.send(JSON.stringify(message));
  }

  private _onConnect = () => {
    this._eventListeners.forEach((listener) => listener.onConnect(this));
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
