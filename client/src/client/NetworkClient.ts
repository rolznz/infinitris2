import Simulation from '@core/Simulation';
import IRenderer from '../rendering/IRenderer';
import IServerMessage from '@core/networking/server/IServerMessage';
import IClientSocketEventListener from '../networking/IClientSocketEventListener';
import ClientMessageType from '@core/networking/client/ClientMessageType';
import ServerMessageType from '@core/networking/server/ServerMessageType';
import Grid from '@core/grid/Grid';
import {
  IJoinRoomResponse,
  JoinRoomResponseStatus,
} from '@core/networking/server/IJoinRoomResponse';
import IClientSocket from '../networking/IClientSocket';
import ClientSocket from '@src/networking/ClientSocket';
import ControlSettings from '@models/ControlSettings';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import ControllablePlayer from '@src/ControllablePlayer';
import IClient from '@models/IClient';
import Input from '@src/input/Input';
import { IPlayer } from '@models/IPlayer';
import { IBlockCreatedEvent } from '@core/networking/server/IBlockCreatedEvent';

export default class NetworkClient
  implements IClient, IClientSocketEventListener
{
  private _socket: IClientSocket;
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _controls?: ControlSettings;
  private _playerInfo?: IPlayer;
  private _input: Input | undefined;
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
    this._renderer = new Infinitris2Renderer();
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
      const joinResponse = message as IJoinRoomResponse;
      const joinResponseData = joinResponse.data;
      if (joinResponseData.status === JoinRoomResponseStatus.OK) {
        await this._renderer.create();
        this._simulation = new Simulation(
          new Grid(
            joinResponseData.grid.numColumns,
            joinResponseData.grid.numRows
          ),
          {},
          true
        );
        this._simulation.addEventListener(this._renderer);
        this._simulation.init();
        console.log('Response: ', joinResponseData);
        for (let player of joinResponseData.players) {
          if (player.id === joinResponseData.playerId) {
            const humanPlayer = new ControllablePlayer(
              this._simulation,
              player.id,
              player.nickname,
              player.color
            );
            this._simulation.addPlayer(humanPlayer);
            this._simulation.followPlayer(humanPlayer);
            this._input = new Input(
              this._simulation,
              humanPlayer,
              this._controls
            );
          } else {
            // TODO:
            //this._simulation.addPlayer(new NetworkPlayer(this._simulation, player.id, player.nickname, player.color));
          }
        }
        this._simulation.startInterval();
      } else {
        alert('Could not join room: ' + joinResponseData.status);
      }
    } else if (message.type === ServerMessageType.BLOCK_CREATED) {
      const blockInfo = (message as IBlockCreatedEvent).blockInfo;
      const player = this._simulation.getPlayer(blockInfo.playerId);
      player.createBlock(
        blockInfo.row,
        blockInfo.column,
        blockInfo.rotation,
        blockInfo.layoutId
      );
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
    console.log('Destroying Network Client');
    if (this._socket) {
      this._socket.disconnect();
    }
    if (!this._simulation) {
      return;
    }
    this._simulation.stopInterval();
    this._renderer.destroy();
    this._input?.destroy();
  }
}
