import Simulation from '@core/Simulation';
import IRenderer from '../rendering/IRenderer';
import Grid from '@core/grid/Grid';
import {
  IServerJoinRoomResponse,
  JoinRoomResponseStatus,
} from '@core/networking/server/IServerJoinRoomResponse';
import ClientSocket from '@src/networking/ClientSocket';
import ControlSettings from '@models/ControlSettings';
import Infinitris2Renderer from '@src/rendering/renderers/infinitris2/Infinitris2Renderer';
import ControllablePlayer from '@src/ControllablePlayer';
import IClient from '@models/IClient';
import Input from '@src/input/Input';
import { IPlayer } from '@models/IPlayer';
import { IServerBlockCreatedEvent } from '@core/networking/server/IServerBlockCreatedEvent';
import ISimulationEventListener from '@models/ISimulationEventListener';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import { IClientBlockMovedEvent } from '@core/networking/client/IClientBlockMovedEvent';
import NetworkPlayer from '@core/player/NetworkPlayer';
import IServerPlayerCreatedEvent from '@core/networking/server/IServerPlayerCreatedEvent';
import IServerPlayerDisconnectedEvent from '@core/networking/server/IServerPlayerDisconnectedEvent';
import IServerBlockMovedEvent from '@core/networking/server/IServerBlockMovedEvent';
import { IServerBlockPlacedEvent } from '@core/networking/server/IServerBlockPlacedEvent';
import { IClientBlockDroppedEvent } from '@core/networking/client/IClientBlockDroppedEvent';
import { IServerBlockDiedEvent } from '@core/networking/server/IServerBlockDiedEvent';
import { IServerNextSpawnEvent } from '@core/networking/server/IServerNextSpawnEvent';
import { IClientSocketEventListener } from '@models/networking/client/IClientSocketEventListener';
import { IClientSocket } from '@models/networking/client/IClientSocket';
import { IServerMessage } from '@models/networking/server/IServerMessage';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';
import { ServerMessageType } from '@models/networking/server/ServerMessageType';
import { LaunchOptions } from '@models/IClientApi';
import IClientJoinRoomRequest from '@core/networking/client/IClientJoinRoomRequest';
import { IServerPlayerToggleSpectatingEvent } from '@core/networking/server/IServerPlayerToggleSpectatingEvent';

export default class NetworkClient
  implements IClient, IClientSocketEventListener, ISimulationEventListener
{
  private _socket: IClientSocket;
  // FIXME: restructure to not require definite assignment
  private _renderer!: IRenderer;
  private _simulation!: Simulation;
  private _launchOptions: LaunchOptions;
  private _playerId?: number;
  private _input: Input | undefined;
  private _lastMessageId: number;
  constructor(url: string, options: LaunchOptions) {
    this._launchOptions = options;
    this._lastMessageId = -1;
    const eventListeners: IClientSocketEventListener[] = [this];
    if (options.socketListener) {
      eventListeners.push(options.socketListener);
    }
    this._socket = new ClientSocket(url, eventListeners);
  }

  /**
   * @inheritdoc
   */
  async onConnect() {
    console.log('Connected');
    this._renderer = new Infinitris2Renderer();
    await this._renderer.create();
    const joinRoomRequest: IClientJoinRoomRequest = {
      type: ClientMessageType.JOIN_ROOM_REQUEST,
      roomId: this._launchOptions.roomId || 0,
    };
    this._socket.sendMessage(joinRoomRequest);
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
    // TODO: wrap IServerMessage in another interface that has messageId
    if ((message as any).messageId !== this._lastMessageId + 1) {
      console.error('Missed one or more server messages');
      this._socket.disconnect();
      return;
    }
    ++this._lastMessageId;
    console.log('Received message: ', message);
    if (message.type === ServerMessageType.JOIN_ROOM_RESPONSE) {
      const joinResponse = message as IServerJoinRoomResponse;
      const joinResponseData = joinResponse.data;
      if (joinResponseData.status === JoinRoomResponseStatus.OK) {
        this._playerId = joinResponseData.playerId;
        this._simulation = new Simulation(
          new Grid(
            joinResponseData.grid.numColumns,
            joinResponseData.grid.numRows
          ),
          joinResponseData.simulation.settings,
          true
        );
        this._simulation.gameMode.loadState(
          joinResponseData.simulation.gameModeState
        );
        this._simulation.dayNumber = joinResponseData.simulation.dayNumber;
        this._simulation.dayLength = joinResponseData.simulation.dayLength;
        this._simulation.nextDay = joinResponseData.simulation.nextDay;
        this._simulation.addEventListener(this._renderer, this);
        if (this._launchOptions?.listener) {
          this._simulation.addEventListener(this._launchOptions.listener);
        }
        this._simulation.init();
        for (let playerInfo of joinResponseData.players) {
          if (playerInfo.id === joinResponseData.playerId) {
            const humanPlayer = new ControllablePlayer(
              this._simulation,
              playerInfo.id,
              playerInfo.nickname,
              playerInfo.color,
              playerInfo.isSpectating
            );
            humanPlayer.estimatedSpawnDelay =
              joinResponseData.estimatedSpawnDelay;
            this._simulation.addPlayer(humanPlayer);
            this._simulation.followPlayer(humanPlayer);
            this._input = new Input(
              this._simulation,
              humanPlayer,
              this._launchOptions?.controls_keyboard,
              this._launchOptions?.controls_gamepad
            );
          } else {
            const otherPlayer = new NetworkPlayer(
              this._simulation,
              playerInfo.id,
              playerInfo.nickname,
              playerInfo.color,
              playerInfo.isSpectating
            );
            this._simulation.addPlayer(otherPlayer);
            otherPlayer.score = playerInfo.score;
          }
        }
        for (let i = 0; i < joinResponseData.grid.reducedCells.length; i++) {
          const row = Math.floor(i / joinResponseData.grid.numColumns);
          const column = i % joinResponseData.grid.numColumns;
          const cellInfo = joinResponseData.grid.reducedCells[i];
          const cellPlayerId = cellInfo.playerId;
          const player =
            cellPlayerId !== undefined
              ? this._simulation.getPlayer(cellPlayerId)
              : undefined;
          if (!cellInfo.isEmpty) {
            this._simulation.grid.cells[row][column].place(player);
          }
        }
        for (let block of joinResponseData.blocks) {
          this._simulation
            .getPlayer(block.playerId)
            .createBlock(
              block.blockId,
              block.row,
              block.column,
              block.rotation,
              block.layoutId,
              true
            );
        }
        this._renderer.rerenderGrid();
        this._simulation.startInterval();
      } else {
        alert('Could not join room: ' + joinResponseData.status);
      }
    } else if (this._simulation) {
      if (message.type === ServerMessageType.PLAYER_CREATED) {
        const playerInfo = (message as IServerPlayerCreatedEvent).playerInfo;
        const newNetworkPlayer = new NetworkPlayer(
          this._simulation,
          playerInfo.id,
          playerInfo.nickname,
          playerInfo.color,
          playerInfo.isSpectating
        );
        this._simulation.addPlayer(newNetworkPlayer);
      } else if (message.type === ServerMessageType.PLAYER_DISCONNECTED) {
        this._simulation.removePlayer(
          (message as IServerPlayerDisconnectedEvent).playerId
        );
      } else if (message.type === ServerMessageType.BLOCK_CREATED) {
        const blockInfo = (message as IServerBlockCreatedEvent).blockInfo;
        const player = this._simulation.getPlayer(blockInfo.playerId);
        player.createBlock(
          blockInfo.blockId,
          blockInfo.row,
          blockInfo.column,
          blockInfo.rotation,
          blockInfo.layoutId,
          true
        );
      } else if (message.type === ServerMessageType.BLOCK_MOVED) {
        const blockInfo = (message as IServerBlockMovedEvent).blockInfo;
        const block = this._simulation.getPlayer(blockInfo.playerId).block!;
        block.move(
          blockInfo.column - block.column,
          blockInfo.row - block.row,
          blockInfo.rotation - block.rotation,
          true
        );
      } else if (message.type === ServerMessageType.BLOCK_PLACED) {
        const blockInfo = (message as IServerBlockPlacedEvent).blockInfo;
        const block = this._simulation.getPlayer(blockInfo.playerId).block!;
        block.move(
          blockInfo.column - block.column,
          blockInfo.row - block.row,
          blockInfo.rotation - block.rotation,
          true
        );
        block.place();
      } else if (message.type === ServerMessageType.BLOCK_DIED) {
        const playerId = (message as IServerBlockDiedEvent).playerId;
        const block = this._simulation.getPlayer(playerId).block!;
        block.die();
      } else if (message.type === ServerMessageType.NEXT_DAY) {
        this._simulation.goToNextDay();
      } else if (message.type === ServerMessageType.NEXT_ROUND) {
        this._simulation.startNextRound();
      } else if (message.type === ServerMessageType.NEXT_SPAWN) {
        this._simulation.getPlayer(this._playerId!).estimatedSpawnDelay = (
          message as IServerNextSpawnEvent
        ).time;
      } else if (message.type === ServerMessageType.PLAYER_TOGGLE_SPECTATING) {
        const playerToggleSpectatingMessage =
          message as IServerPlayerToggleSpectatingEvent;
        this._simulation.getPlayer(
          playerToggleSpectatingMessage.playerId
        ).isSpectating = playerToggleSpectatingMessage.isSpectating;
      }
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

  onSimulationInit(simulation: ISimulation): void {}
  onSimulationStep(simulation: ISimulation): void {}
  onSimulationNextDay(): void {}
  onSimulationNextRound(): void {}
  onBlockCreated(block: IBlock): void {}
  onBlockCreateFailed(block: IBlock): void {}
  onBlockPlaced(block: IBlock): void {}
  onBlockMoved(block: IBlock): void {
    if (block.player.id === this._playerId && !block.isDropping) {
      const blockMovedEvent: IClientBlockMovedEvent = {
        type: ClientMessageType.BLOCK_MOVED,
        data: {
          column: block.column,
          row: block.row,
          rotation: block.rotation,
          blockId: block.id,
        },
      };
      this._socket.sendMessage(blockMovedEvent);
    }
  }
  onBlockDropped(block: IBlock): void {
    if (block.player.id === this._playerId) {
      const blockDroppedEvent: IClientBlockDroppedEvent = {
        type: ClientMessageType.BLOCK_DROPPED,
        data: {
          blockId: block.id,
        },
      };
      this._socket.sendMessage(blockDroppedEvent);
    }
  }
  onBlockDied(block: IBlock): void {}
  onBlockDestroyed(block: IBlock): void {}
  onPlayerCreated(player: IPlayer): void {}
  onPlayerDestroyed(player: IPlayer): void {}
  onPlayerToggleChat(player: IPlayer): void {}
  onPlayerToggleSpectating() {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
  onLineCleared(row: number): void {}
  onGridCollapsed(grid: IGrid): void {}
  onGridReset(grid: IGrid): void {}
}
