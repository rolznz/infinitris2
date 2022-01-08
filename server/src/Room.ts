import Simulation from '@core/Simulation';
import ISimulationEventListener from '@models/ISimulationEventListener';
import NetworkPlayer from '@core/player/NetworkPlayer';
import IClientMessage from '@core/networking/client/IClientMessage';
import { SendServerMessageFunction } from './networking/ServerSocket';
import ServerMessageType from '@core/networking/server/ServerMessageType';
import {
  IJoinRoomResponse,
  JoinRoomResponseStatus,
} from '@core/networking/server/IJoinRoomResponse';
import IPlayerConnectedEvent from '@core/networking/server/IPlayerConnectedEvent';
import IPlayerDisconnectedEvent from '@core/networking/server/IPlayerDisconnectedEvent';
import Grid from '@core/grid/Grid';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import { ServerMessage } from './networking/IServerSocket';
import { IBlockCreatedEvent } from '@core/networking/server/IBlockCreatedEvent';
import {
  colors,
  hexToString,
  NetworkPlayerInfo,
  stringToHex,
  tetrominoes,
} from '@models/index';
import ClientMessageType from '@core/networking/client/ClientMessageType';
import { IClientBlockMovedEvent } from '@core/networking/client/IClientBlockMovedEvent';
import IServerBlockMovedEvent from '@core/networking/server/IServerBlockMovedEvent';

export default class Room implements ISimulationEventListener {
  private _sendMessage: SendServerMessageFunction;
  private _simulation: Simulation;

  constructor(sendMessage: SendServerMessageFunction) {
    this._sendMessage = sendMessage;
    this._simulation = new Simulation(new Grid());
    this._simulation.init();
    this._simulation.startInterval();
  }

  /**
   * Gets the room's simulation.
   */
  get simulation(): Simulation {
    return this._simulation;
  }

  /**
   * Creates a player and adds it to the room and the room's simulation.
   *
   * @param playerId id of new player
   * @param playerInfo
   */
  addPlayer(playerId: number /*, playerInfo: NetworkPlayerInfo*/) {
    const newPlayer = new NetworkPlayer(
      this._simulation,
      playerId,
      'Player ' + playerId,
      stringToHex(colors[Math.floor(Math.random() * colors.length)].hex)
    );
    const currentPlayerIds: number[] = this._simulation.getPlayerIds();
    this._simulation.addPlayer(newPlayer);
    newPlayer.addEventListener(this);

    const joinRoomResponse: IJoinRoomResponse = {
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
      data: {
        status: JoinRoomResponseStatus.OK,
        playerId: newPlayer.id,
        grid: {
          numRows: this._simulation.grid.numRows,
          numColumns: this._simulation.grid.numColumns,
          reducedCells: this._simulation.grid.reducedCells.map((cell) => ({
            playerId: cell.player?.id || -1,
          })),
        },
        blocks: this._simulation.players
          .map((player) => player.block as IBlock)
          .filter((block) => block)
          .map((block) => ({
            playerId: block.player.id,
            row: block.row,
            column: block.column,
            rotation: block.rotation,
            isDropping: block.isDropping,
            layoutId: block.layoutId,
          })),
        players: this._simulation.players.map((existingPlayer) => ({
          color: existingPlayer.color,
          id: existingPlayer.id,
          nickname: existingPlayer.nickname,
        })),
      },
    };

    this._sendMessage(joinRoomResponse, newPlayer.id);

    const newPlayerMessage: IPlayerConnectedEvent = {
      type: ServerMessageType.PLAYER_CONNECTED,
      playerInfo: {
        id: newPlayer.id,
        color: newPlayer.color,
        nickname: newPlayer.nickname,
      },
    };

    this._sendMessage(newPlayerMessage, ...currentPlayerIds);
  }

  /**
   * Removes a player from the room and the room's simulation.
   *
   * @param playerId the id of the player to remove.
   */
  removePlayer(playerId: number) {
    this._simulation.removePlayer(playerId);

    const playerDisconnectedMessage: IPlayerDisconnectedEvent = {
      type: ServerMessageType.PLAYER_DISCONNECTED,
      playerId,
    };
    this._sendMessageToAllPlayers(playerDisconnectedMessage);
  }

  /**
   * Triggered when a message is received from a client.
   *
   * @param playerId the id of the player.
   * @param message the message the client sent.
   */
  onClientMessage(playerId: number, message: IClientMessage) {
    //console.log('Room received message from player ' + playerId + ':', message);
    if (message.type === ClientMessageType.BLOCK_MOVED) {
      const block = this._simulation.getPlayer(playerId)?.block;
      if (block) {
        const blockInfo = (message as IClientBlockMovedEvent).data;
        block.move(
          blockInfo.column - block.column,
          blockInfo.row - block.row,
          blockInfo.rotation - block.rotation,
          true
        );
      } else {
        console.error('Block not set for player ' + playerId);
      }
    } else {
      console.error(
        'Unsupported room message received from ' +
          playerId +
          ': ' +
          message.type
      );
    }
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: Simulation) {}

  /**
   * @inheritdoc
   */
  onSimulationStep(simulation: Simulation) {}

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    console.log('Block created: ' + block.player.id);
    const blockCreatedMessage: IBlockCreatedEvent = {
      type: ServerMessageType.BLOCK_CREATED,
      blockInfo: {
        column: block.column,
        row: block.row,
        playerId: block.player.id,
        isDropping: false,
        layoutId: block.layoutId,
        rotation: block.rotation,
      },
    };
    this._sendMessageToAllPlayers(blockCreatedMessage);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {
    const playerIds = this._simulation
      .getPlayerIds()
      .filter((playerId) => playerId != block.player.id);
    for (const playerId of playerIds) {
      const blockMovedEvent: IServerBlockMovedEvent = {
        type: ServerMessageType.BLOCK_MOVED,
        data: {
          playerId,
          column: block.column,
          row: block.row,
          rotation: block.rotation,
        },
      };
      this._sendMessage(blockMovedEvent, ...playerIds);
    }
  }

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {}

  onBlockCreateFailed(block: IBlock): void {}
  onBlockDied(block: IBlock): void {}
  onBlockDestroyed(block: IBlock): void {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
  onGridCollapsed(grid: IGrid): void {}

  private _sendMessageToAllPlayers(message: ServerMessage) {
    const playerIds: number[] = this._simulation.getPlayerIds();
    this._sendMessage(message, ...playerIds);
  }
}
