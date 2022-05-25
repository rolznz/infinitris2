import Simulation from '@core/simulation/Simulation';
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
import { IPlayer, NetworkPlayerInfo } from '@models/IPlayer';
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
import { ClientApiConfig, LaunchOptions } from '@models/IClientApi';
import IClientJoinRoomRequest from '@core/networking/client/IClientJoinRoomRequest';
import { IServerPlayerChangeStatusEvent } from '@core/networking/server/IServerPlayerChangeStatusEvent';
import { BaseClient } from '@src/client/BaseClient';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IServerClearLinesEvent } from '@core/networking/server/IServerClearLinesEvent';
import { IServerEndRoundEvent } from '@core/networking/server/IServerEndRoundEvent';
import { NETWORK_VERSION } from '@models/index';
import { IServerBlockDroppedEvent } from '@core/networking/server/IServerBlockDroppedEvent';

export default class NetworkClient
  extends BaseClient
  implements IClientSocketEventListener, Partial<ISimulationEventListener>
{
  private _socket: IClientSocket;
  // FIXME: restructure to not require definite assignment
  private _renderer!: BaseRenderer;
  private _playerId?: number;
  private _input: Input | undefined;
  private _lastMessageId: number;
  constructor(
    clientApiConfig: ClientApiConfig,
    url: string,
    options: LaunchOptions
  ) {
    super(clientApiConfig, options);
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
    this._renderer = new Infinitris2Renderer(
      this._clientApiConfig,
      undefined,
      undefined,
      undefined,
      this._launchOptions.worldType,
      this._launchOptions.worldVariation,
      this._launchOptions.useFallbackUI
    );
    await this._renderer.create();
    const joinRoomRequest: IClientJoinRoomRequest = {
      type: ClientMessageType.JOIN_ROOM_REQUEST,
      roomIndex: this._launchOptions.roomIndex || 0,
      player: this._launchOptions.player,
      networkVersion: NETWORK_VERSION,
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
        this._simulation.gameMode.deserialize(
          joinResponseData.simulation.gameModeState
        );
        this._simulation.addEventListener(this._renderer, this);
        if (this._launchOptions?.listeners) {
          this._simulation.addEventListener(...this._launchOptions.listeners);
        }
        this._simulation.init();
        if (this._simulation.round && joinResponseData.simulation.round) {
          this._simulation.round.deserialize(joinResponseData.simulation.round);
        }
        for (let playerInfo of joinResponseData.players) {
          if (playerInfo.id === joinResponseData.playerId) {
            const humanPlayer = new ControllablePlayer(
              this._simulation,
              playerInfo.id,
              playerInfo.status,
              playerInfo.nickname,
              playerInfo.color,
              playerInfo.patternFilename,
              playerInfo.characterId
            );
            humanPlayer.estimatedSpawnDelay =
              joinResponseData.estimatedSpawnDelay;
            this._simulation.addPlayer(humanPlayer);
            this._simulation.followPlayer(humanPlayer);
            this._input = new Input(
              this._simulation,
              this._renderer.onInputAction,
              this._renderer.screenPositionToCell,
              humanPlayer,
              this._launchOptions?.controls_keyboard,
              this._launchOptions?.controls_gamepad
            );
          } else {
            const otherPlayer = this._createNetworkPlayer(playerInfo);
            this._simulation.addPlayer(otherPlayer);
            otherPlayer.score = playerInfo.score;
            otherPlayer.health = playerInfo.health;
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
        let message = 'Unknown';
        switch (joinResponseData.status) {
          case JoinRoomResponseStatus.FULL:
            message = 'Room is full';
            break;
          case JoinRoomResponseStatus.INCORRECT_VERSION:
            message = 'Incorrect version';
            break;
          case JoinRoomResponseStatus.NOT_READY:
            message = 'Server is not ready yet';
            break;
          case JoinRoomResponseStatus.WRONG_PASSWORD:
            message = 'Wrong password';
            break;
        }
        this._socket.disconnect();
        alert('Could not join room: ' + message);
      }
    } else if (this._simulation) {
      if (message.type === ServerMessageType.PLAYER_CREATED) {
        const playerInfo = (message as IServerPlayerCreatedEvent).playerInfo;
        const newNetworkPlayer = this._createNetworkPlayer(playerInfo);
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
      } else if (message.type === ServerMessageType.BLOCK_DROPPED) {
        const playerId = (message as IServerBlockDroppedEvent).playerId;
        const block = this._simulation.getPlayer(playerId).block!;
        block.drop();
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
      } else if (message.type === ServerMessageType.START_NEXT_ROUND_TIMER) {
        this._simulation.round!.restartNextRoundTimer();
      } else if (message.type === ServerMessageType.NEXT_ROUND) {
        this._simulation.round!.start();
      } else if (message.type === ServerMessageType.END_ROUND) {
        const winnerId = (message as IServerEndRoundEvent).winnerId;
        const winner: IPlayer | undefined =
          winnerId !== undefined
            ? this._simulation.getPlayer(winnerId)
            : undefined;
        this._simulation.round!.end(winner);
      } else if (message.type === ServerMessageType.NEXT_SPAWN) {
        this._simulation.getPlayer(this._playerId!).estimatedSpawnDelay = (
          message as IServerNextSpawnEvent
        ).time;
      } else if (message.type === ServerMessageType.PLAYER_CHANGE_STATUS) {
        const playerChangeStatusMessage =
          message as IServerPlayerChangeStatusEvent;
        this._simulation.getPlayer(playerChangeStatusMessage.playerId).status =
          playerChangeStatusMessage.status;
      } else if (message.type === ServerMessageType.CLEAR_LINES) {
        const clearLinesMessage = message as IServerClearLinesEvent;
        this._simulation.grid.clearLines(clearLinesMessage.rows);
      }
    }
  }
  private _createNetworkPlayer(playerInfo: NetworkPlayerInfo): NetworkPlayer {
    return new NetworkPlayer(
      -1,
      this._simulation,
      playerInfo.id,
      playerInfo.status,
      playerInfo.isBot,
      playerInfo.nickname,
      playerInfo.color,
      playerInfo.patternFilename,
      playerInfo.characterId
    );
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
}
