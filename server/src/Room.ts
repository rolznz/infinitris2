import Simulation from '@core/Simulation';
import ISimulationEventListener from 'models/src/ISimulationEventListener';
import NetworkPlayer from '@core/player/NetworkPlayer';
import IClientMessage from '@core/networking/client/IClientMessage';
import { SendServerMessageFunction } from './networking/ServerSocket';
import ServerMessageType from '@core/networking/server/ServerMessageType';
import IJoinRoomResponse, {
  JoinRoomResponseStatus,
} from '@core/networking/server/IJoinRoomResponse';
import IPlayerConnectedEvent from '@core/networking/server/IPlayerConnectedEvent';
import IPlayerDisconnectedEvent from '@core/networking/server/IPlayerDisconnectedEvent';
import Grid from '@core/grid/Grid';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';

export default class Room implements ISimulationEventListener {
  private _sendMessage: SendServerMessageFunction;
  private _simulation: Simulation;

  constructor(sendMessage: SendServerMessageFunction) {
    this._sendMessage = sendMessage;
    this._simulation = new Simulation(new Grid());
    this._simulation.init();
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

    const joinRoomResponse: IJoinRoomResponse = {
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
      data: {
        status: JoinRoomResponseStatus.OK,
        playerId: player.id,
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
    const playerIds: number[] = this._simulation.getPlayerIds();
    const playerDisconnectedMessage: IPlayerDisconnectedEvent = {
      type: ServerMessageType.PLAYER_DISCONNECTED,
      playerId,
    };
    this._sendMessage(playerDisconnectedMessage, ...playerIds);
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
  onBlockCreated(block: IBlock) {}

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
}
