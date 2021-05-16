import Simulation from '@core/Simulation';
import IRenderer from '../rendering/IRenderer';
import MinimalRenderer from '../rendering/renderers/minimal/MinimalRenderer';
import IServerMessage from '@core/networking/server/IServerMessage';
import IClientSocketEventListener from '../networking/IClientSocketEventListener';
import ClientMessageType from '@core/networking/client/ClientMessageType';
import ServerMessageType from '@core/networking/server/ServerMessageType';
import Grid from '@core/grid/Grid';
import IClientSocket from '../networking/IClientSocket';
import IClient from '../../../models/src/IClient';
import ClientSocket from '@src/networking/ClientSocket';
import ControlSettings from '@models/ControlSettings';
import IPlayer from '@models/IPlayer';

export default class NetworkClient
  implements IClient, IClientSocketEventListener {
  private _socket: IClientSocket;
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _controls?: ControlSettings;
  private _playerInfo?: IPlayer;
  constructor(
    url: string,
    listener?: IClientSocketEventListener,
    controls?: ControlSettings,
    playerInfo?: IPlayer
  ) {
    this._controls = controls;
    this._playerInfo = playerInfo;
    const eventListeners: IClientSocketEventListener[] = [this];
    if (listener) {
      eventListeners.push(listener);
    }
    this._socket = new ClientSocket(url, eventListeners);
  }

  /**
   * @inheritdoc
   */
  onConnect() {
    console.log('Connected');
    this._renderer = new MinimalRenderer();
    this._socket.sendMessage({ type: ClientMessageType.JOIN_ROOM_REQUEST });
  }

  /**
   * @inheritdoc
   */
  onDisconnect() {
    console.log('Disconnected');
  }

  /**
   * @inheritdoc
   */
  async onMessage(message: IServerMessage) {
    console.log('Received message: ', message);
    if (message.type === ServerMessageType.JOIN_ROOM_RESPONSE) {
      await this._renderer.create();
      this._simulation = new Simulation(new Grid());
      this._simulation.addEventListener(this._renderer);
      this._simulation.init();
    }
  }

  /**
   * @inheritdoc
   */
  restart(): void {
    throw new Error('Method not implemented.');
  }

  /**
   * @inheritdoc
   */
  destroy() {
    if (this._socket) {
      this._socket.disconnect();
    }
    if (!this._simulation) {
      return;
    }
    this._simulation.stopInterval();
    this._renderer.destroy();
  }
}
