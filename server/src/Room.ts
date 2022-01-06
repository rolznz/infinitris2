import Simulation from '@core/Simulation';
import ISimulationEventListener from 'models/src/ISimulationEventListener';
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
import { tetrominoes } from '@models/index';

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
   * @param playerId the id of the player to add.
   */
  addPlayer(playerId: number) {
    const player = new NetworkPlayer(
      this._simulation,
      playerId,
      undefined,
      undefined
    );
    const currentPlayerIds: number[] = this._simulation.getPlayerIds();
    this._simulation.addPlayer(player);
    player.addEventListener(this);

    const joinRoomResponse: IJoinRoomResponse = {
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
      data: {
        status: JoinRoomResponseStatus.OK,
        playerId: player.id,
        grid: {
          numRows: this._simulation.grid.numRows,
          numColumns: this._simulation.grid.numColumns,
          reducedCells: this._simulation.grid.reducedCells.map((cell) => ({
            playerId: cell.player?.id || -1,
          })),
        },
        blocks: [],
        players: this._simulation.players.map((player) => ({
          color: player.color,
          id: player.id,
          nickname: player.nickname,
        })),
      },
    };

    this._sendMessage(joinRoomResponse, player.id);

    const newPlayerMessage: IPlayerConnectedEvent = {
      type: ServerMessageType.PLAYER_CONNECTED,
      playerId: player.id,
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
    console.log('Room received message from player ' + playerId + ':', message);
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
        layoutId: Object.values(tetrominoes).indexOf(block.initialLayout),
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
  onBlockMoved(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {}

  onBlockCreateFailed(block: IBlock): void {}
  onBlockDied(block: IBlock): void {}
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
