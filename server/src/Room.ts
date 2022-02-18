import Simulation from '@core/Simulation';
import ISimulationEventListener from '@models/ISimulationEventListener';
import NetworkPlayer from '@core/player/NetworkPlayer';
import { SendServerMessageFunction } from './networking/ServerSocket';
import {
  IServerJoinRoomResponse,
  JoinRoomResponseStatus,
} from '@core/networking/server/IServerJoinRoomResponse';
import IServerPlayerCreatedEvent from '@core/networking/server/IServerPlayerCreatedEvent';
import IServerPlayerDisconnectedEvent from '@core/networking/server/IServerPlayerDisconnectedEvent';
import Grid from '@core/grid/Grid';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import { ServerMessage } from './networking/IServerSocket';
import { IServerBlockCreatedEvent } from '@core/networking/server/IServerBlockCreatedEvent';
import { IClientBlockMovedEvent } from '@core/networking/client/IClientBlockMovedEvent';
import IServerBlockMovedEvent from '@core/networking/server/IServerBlockMovedEvent';
import { IServerBlockPlacedEvent } from '@core/networking/server/IServerBlockPlacedEvent';
import { IServerBlockDiedEvent } from '@core/networking/server/IServerBlockDiedEvent';
import { IServerBlockDroppedEvent } from '@core/networking/server/IServerBlockDroppedEvent';
import { IServerNextDayEvent } from '@core/networking/server/IServerNextDayEvent';
import { IServerNextSpawnEvent } from '@core/networking/server/IServerNextSpawnEvent';
import { stringToHex } from '@models/util/stringToHex';
import { colors } from '@models/colors';
import { IPlayer, NetworkPlayerInfo } from '@models/IPlayer';
import { IClientBlockDroppedEvent } from '@core/networking/client/IClientBlockDroppedEvent';
import { IClientMessage } from '@models/networking/client/IClientMessage';
import { ServerMessageType } from '@models/networking/server/ServerMessageType';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';
import { IClientChatMessage } from '@models/networking/client/IClientChatMessage';
import { IServerChatMessage } from '@models/networking/server/IServerChatMessage';
import { GameModeType } from '@models/GameModeType';
import AIPlayer from '@core/player/AIPlayer';
import { IServerPlayerToggleSpectatingEvent } from '@core/networking/server/IServerPlayerToggleSpectatingEvent';

export default class Room implements ISimulationEventListener {
  private _sendMessage: SendServerMessageFunction;
  private _simulation: Simulation;

  constructor(
    sendMessage: SendServerMessageFunction,
    gameModeType: GameModeType
  ) {
    this._sendMessage = sendMessage;
    this._simulation = new Simulation(new Grid(50, 18), {
      gameModeType,
    });
    this._simulation.addEventListener(this);
    this._simulation.init();
    //this._simulation.startInterval();
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
  addPlayer(playerId: number, playerInfo?: Partial<NetworkPlayerInfo>) {
    let freeColor = 0;
    let colorIndex = 0;
    if (
      !playerInfo?.color ||
      this._simulation.players.some(
        (player) => player.color === playerInfo.color
      )
    ) {
      do {
        freeColor = stringToHex(colors[colorIndex++].hex);
      } while (
        colorIndex < colors.length &&
        this._simulation.players.some((player) => player.color === freeColor)
      );
    } else {
      freeColor = playerInfo.color;
    }
    const originalPlayerNickname = playerInfo?.nickname || 'Player ' + playerId;
    let playerNickname = originalPlayerNickname;
    let freeNickNameIndex = 0;
    while (
      this._simulation.players.some(
        (player) => player.nickname === playerNickname
      )
    ) {
      playerNickname = `${originalPlayerNickname} (${++freeNickNameIndex})`;
    }

    const newPlayer = new NetworkPlayer(
      this._simulation,
      playerId,
      playerNickname,
      freeColor,
      this._simulation.shouldNewPlayerSpectate,
      playerInfo?.patternFilename,
      playerInfo?.characterId || '0'
    );

    this._simulation.addPlayer(newPlayer);

    const joinRoomResponse: IServerJoinRoomResponse = {
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
      data: {
        status: JoinRoomResponseStatus.OK,
        playerId: newPlayer.id,
        simulation: {
          dayNumber: this._simulation.dayNumber,
          dayLength: this._simulation.dayLength,
          nextDay: this._simulation.nextDay,
          settings: this._simulation.settings,
          gameModeState: this._simulation.gameMode.getCurrentState(),
        },
        grid: {
          numRows: this._simulation.grid.numRows,
          numColumns: this._simulation.grid.numColumns,
          reducedCells: this._simulation.grid.reducedCells.map((cell) => ({
            playerId: cell.player?.id,
            isEmpty: cell.isEmpty,
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
            blockId: block.id,
          })),
        players: this._simulation.players.map((existingPlayer) => ({
          color: existingPlayer.color,
          id: existingPlayer.id,
          nickname: existingPlayer.nickname,
          score: existingPlayer.score,
          isSpectating: existingPlayer.isSpectating,
          characterId: existingPlayer.characterId,
          patternFilename: existingPlayer.patternFilename,
        })),
        estimatedSpawnDelay: newPlayer.estimatedSpawnDelay,
      },
    };

    this._sendMessage(joinRoomResponse, newPlayer.id);

    this._simulation.startInterval();
  }

  /**
   * Removes a player from the room and the room's simulation.
   *
   * @param playerId the id of the player to remove.
   */
  removePlayer(playerId: number) {
    this._simulation.removePlayer(playerId);
  }

  /**
   * Triggered when a message is received from a client.
   *
   * @param playerId the id of the player.
   * @param message the message the client sent.
   */
  onClientMessage(playerId: number, message: IClientMessage) {
    //console.log('Room received message from player ' + playerId + ':', message);
    //console.log('Received client message', message);
    if (message.type === ClientMessageType.BLOCK_MOVED) {
      const block = this._simulation.getPlayer(playerId)?.block;
      const blockInfo = (message as IClientBlockMovedEvent).data;
      if (block?.id === blockInfo.blockId) {
        block.move(
          blockInfo.column - block.column,
          blockInfo.row - block.row,
          blockInfo.rotation - block.rotation,
          true
        );
      }
    } else if (message.type === ClientMessageType.BLOCK_DROPPED) {
      const block = this._simulation.getPlayer(playerId)?.block;
      const blockInfo = (message as IClientBlockDroppedEvent).data;
      if (block?.id === blockInfo.blockId) {
        block.drop();
      }
    } else if (message.type === ClientMessageType.CHAT) {
      const clientMessage = message as IClientChatMessage;
      if (
        this._simulation.getPlayer(playerId) &&
        clientMessage.message.length
      ) {
        if (!clientMessage.message.startsWith('/')) {
          const serverChatMessage: IServerChatMessage = {
            type: ServerMessageType.CHAT,
            message: clientMessage.message,
            playerId: playerId,
          };
          this._sendMessageToAllPlayers(serverChatMessage);
        } else {
          if (clientMessage.message.startsWith('/addbot')) {
            // find a random bot color - unique until there are more players than colors
            // TODO: move to simulation and notify player of color switch if their color is already in use
            let freeColors = colors
              .map((color) => stringToHex(color.hex))
              .filter(
                (color) =>
                  this._simulation.players
                    .map((player) => player.color)
                    .indexOf(color) < 0
              );
            if (!freeColors.length) {
              freeColors = colors.map((color) => stringToHex(color.hex));
            }

            // FIXME: socket ids should not have to match player IDs
            const botId = this._simulation.getFreePlayerId(100000);
            const botNickname = 'Bot ' + botId;
            const botColor =
              freeColors[Math.floor(Math.random() * (freeColors.length - 1))];

            const bot = new AIPlayer(
              this._simulation,
              botId,
              botNickname,
              botColor,
              parseInt(clientMessage.message.split(' ')[1] || '30'),
              this._simulation.shouldNewPlayerSpectate
            );
            this._simulation.addPlayer(bot);
          } else if (clientMessage.message.startsWith('/kickbots')) {
            for (const player of this._simulation.players) {
              if (!player.isNetworked) {
                this._simulation.removePlayer(player.id);
              }
            }
          } else if (clientMessage.message.startsWith('/nextround')) {
            this._simulation.startNextRound();
          }
        }
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

  onSimulationNextDay(): void {
    const nextDayEvent: IServerNextDayEvent = {
      type: ServerMessageType.NEXT_DAY,
    };
    this._sendMessageToAllPlayers(nextDayEvent);
  }

  onSimulationNextRound(): void {
    const nextRoundEvent: IServerNextDayEvent = {
      type: ServerMessageType.NEXT_ROUND,
    };
    this._sendMessageToAllPlayers(nextRoundEvent);
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    //console.log('Block created: ' + block.player.id);
    const blockCreatedMessage: IServerBlockCreatedEvent = {
      type: ServerMessageType.BLOCK_CREATED,
      blockInfo: {
        column: block.column,
        row: block.row,
        playerId: block.player.id,
        isDropping: false,
        layoutId: block.layoutId,
        rotation: block.rotation,
        blockId: block.id,
      },
    };
    this._sendMessageToAllPlayers(blockCreatedMessage);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    const blockPlacedEvent: IServerBlockPlacedEvent = {
      type: ServerMessageType.BLOCK_PLACED,
      blockInfo: {
        playerId: block.player.id,
        column: block.column,
        row: block.row,
        rotation: block.rotation,
      },
    };
    this._sendMessageToAllPlayers(blockPlacedEvent);
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {
    const blockMovedEvent: IServerBlockMovedEvent = {
      type: ServerMessageType.BLOCK_MOVED,
      blockInfo: {
        playerId: block.player.id,
        column: block.column,
        row: block.row,
        rotation: block.rotation,
      },
    };
    this._sendMessageToAllPlayersExcept(blockMovedEvent, block.player.id);
  }

  onBlockDropped(block: IBlock): void {
    const blockDroppedEvent: IServerBlockDroppedEvent = {
      type: ServerMessageType.BLOCK_DROPPED,
      playerId: block.player.id,
    };
    this._sendMessageToAllPlayersExcept(blockDroppedEvent, block.player.id);
  }

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {}

  onBlockCreateFailed(block: IBlock): void {}
  onBlockDied(block: IBlock): void {
    const blockDiedEvent: IServerBlockDiedEvent = {
      type: ServerMessageType.BLOCK_DIED,
      playerId: block.player.id,
    };
    this._sendMessageToAllPlayers(blockDiedEvent);
  }
  onBlockDestroyed(block: IBlock): void {
    const nextSpawnEvent: IServerNextSpawnEvent = {
      type: ServerMessageType.NEXT_SPAWN,
      time: block.player.estimatedSpawnDelay,
    };
    this._sendMessage(nextSpawnEvent, block.player.id);
  }
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
  onCellIsEmptyChanged(cell: ICell): void {}
  onGridCollapsed(grid: IGrid): void {}
  onGridReset(grid: IGrid): void {}

  onPlayerCreated(player: IPlayer) {
    const newPlayerMessage: IServerPlayerCreatedEvent = {
      type: ServerMessageType.PLAYER_CREATED,
      playerInfo: {
        id: player.id,
        color: player.color,
        nickname: player.nickname,
        isSpectating: player.isSpectating,
      },
    };

    this._sendMessageToAllPlayersExcept(newPlayerMessage, player.id);
  }
  onPlayerDestroyed(player: IPlayer): void {
    const playerDisconnectedMessage: IServerPlayerDisconnectedEvent = {
      type: ServerMessageType.PLAYER_DISCONNECTED,
      playerId: player.id,
    };
    this._sendMessageToAllPlayers(playerDisconnectedMessage);
    if (!this._simulation.players.filter((p) => p.isNetworked).length) {
      for (const player of this._simulation.players) {
        if (!player.isNetworked) {
          this._simulation.removePlayer(player.id);
        }
      }
      this._simulation.grid.reset();
      this._simulation.stopInterval();
    }
  }
  onPlayerToggleChat(player: IPlayer): void {
    console.error('TODO: mark player as chatting/not chatting');
  }
  onPlayerToggleSpectating(player: IPlayer) {
    const playerToggleSpectatingMessage: IServerPlayerToggleSpectatingEvent = {
      type: ServerMessageType.PLAYER_TOGGLE_SPECTATING,
      playerId: player.id,
      isSpectating: player.isSpectating,
    };
    this._sendMessageToAllPlayers(playerToggleSpectatingMessage);
  }

  private _sendMessageToAllPlayers(message: ServerMessage) {
    const playerIds: number[] = this._simulation.getPlayerIds();
    this._sendMessage(message, ...playerIds);
  }

  private _sendMessageToAllPlayersExcept(
    message: ServerMessage,
    playerId: number
  ) {
    const playerIds = this._simulation
      .getPlayerIds()
      .filter((otherPlayerId) => otherPlayerId != playerId);
    this._sendMessage(message, ...playerIds);
  }
}
