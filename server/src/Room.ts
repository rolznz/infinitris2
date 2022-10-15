import Simulation from '@core/simulation/Simulation';
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
import IGrid, { PartialClearRow } from '@models/IGrid';
import { IServerBlockCreatedEvent } from '@core/networking/server/IServerBlockCreatedEvent';
import { IClientBlockMovedEvent } from '@core/networking/client/IClientBlockMovedEvent';
import IServerBlockMovedEvent from '@core/networking/server/IServerBlockMovedEvent';
import { IServerBlockPlacedEvent } from '@core/networking/server/IServerBlockPlacedEvent';
import { IServerBlockDiedEvent } from '@core/networking/server/IServerBlockDiedEvent';
import { IServerBlockDroppedEvent } from '@core/networking/server/IServerBlockDroppedEvent';
import { IServerNextSpawnEvent } from '@core/networking/server/IServerNextSpawnEvent';
import { stringToHex } from '@models/util/stringToHex';
import { colors } from '@models/colors';
import { IPlayer, NetworkPlayerInfo, PlayerStatus } from '@models/IPlayer';
import { IClientBlockDroppedEvent } from '@core/networking/client/IClientBlockDroppedEvent';
import { IClientMessage } from '@models/networking/client/IClientMessage';
import { ServerMessageType } from '@models/networking/server/ServerMessageType';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';
import { IClientChatMessage } from '@models/networking/client/IClientChatMessage';
import { GameModeType } from '@models/GameModeType';
import AIPlayer from '@core/player/AIPlayer';
import { IServerNextRoundEvent } from '@core/networking/server/IServerNextRoundEvent';
import { IServerClearLinesEvent } from '@core/networking/server/IServerClearLinesEvent';
import { GameModeEvent } from '@models/GameModeEvent';
import { reservedPlayerIds } from '@models/networking/reservedPlayerIds';
import { IServerEndRoundEvent } from '@core/networking/server/IServerEndRoundEvent';
import { IServerStartNextRoundTimerEvent } from '@core/networking/server/IServerStartNextRoundTimerEvent';
import { IServerPlayerChangeStatusEvent } from '@core/networking/server/IServerPlayerChangeStatusEvent';
import { IServerMessage } from '@models/networking/server/IServerMessage';
import { ICharacter } from '@models/ICharacter';
import IRoom from '@models/IRoom';
import ISimulation from '@models/ISimulation';
import { IServerPlayerKilledEvent } from '@core/networking/server/IServerPlayerKilledEvent';
import { IServerGameModeEvent } from '@core/networking/server/IServerGameModeEvent';
import IClientToggleChatEvent from '@core/networking/client/IClientToggleChatEvent';
import { IServerPlayerToggleChatEvent } from '@core/networking/server/IServerPlayerToggleChatEvent';
import { IServerSimulationMessage } from '@models/networking/server/IServerSimulationMessage';
import { WithId } from '@models/WithId';

export default class Room implements Partial<ISimulationEventListener> {
  private _sendMessage: SendServerMessageFunction;
  private _simulation: Simulation;
  private _roomInfo: IRoom;

  constructor(
    sendMessage: SendServerMessageFunction,
    roomInfo: IRoom,
    charactersPool: WithId<ICharacter>[] | undefined
  ) {
    this._roomInfo = roomInfo;
    this._sendMessage = sendMessage;
    this._simulation = new Simulation(
      new Grid(roomInfo.gridNumColumns ?? 50, roomInfo.gridNumRows ?? 16),
      roomInfo.simulationSettings,
      undefined,
      undefined,
      charactersPool
    );
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

  get info(): IRoom {
    return this._roomInfo;
  }

  /**
   * Creates a player and adds it to the room and the room's simulation.
   *
   * @param socketId id of the player's socket
   * @param playerInfo
   */
  addPlayer(socketId: number, playerInfo?: Partial<NetworkPlayerInfo>) {
    const playerId = this._simulation.getFreePlayerId();
    console.log('Client ' + socketId + ' assigned player ID ' + playerId);

    // TODO: verify the player actually owns the character
    // TODO: update this function to check nicknames
    const character = this._simulation.generateCharacter(
      playerId,
      false,
      playerInfo?.characterId
    );
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
      socketId,
      this._simulation,
      playerId,
      playerInfo?.status === PlayerStatus.spectating
        ? PlayerStatus.spectating
        : this._simulation.shouldNewPlayerSpectate
        ? PlayerStatus.knockedOut
        : PlayerStatus.ingame,
      false,
      playerNickname,
      stringToHex(character.color!),
      character.patternFilename!,
      character.id!.toString(),
      playerInfo?.isPremium, // TODO: verify using JWT
      playerInfo?.isNicknameVerified // TODO: verify using JWT
    );

    this._simulation.addPlayer(newPlayer);

    const joinRoomResponse: IServerJoinRoomResponse = {
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
      data: {
        status: JoinRoomResponseStatus.OK,
        playerId: newPlayer.id,
        simulation: {
          settings: this._simulation.settings,
          gameModeState: this._simulation.gameMode.serialize(),
          round: this._simulation.round?.serialize(),
        },
        grid: {
          numRows: this._simulation.grid.numRows,
          numColumns: this._simulation.grid.numColumns,
          reducedCells: this._simulation.grid.reducedCells.map((cell) => ({
            playerId: cell.player?.id,
            challengeCellType: cell.behaviour.toChallengeCellType(),
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
        players: this._simulation.players.map(createPlayerInfo),
        estimatedSpawnDelay: newPlayer.estimatedSpawnDelay,
      },
    };

    this._sendMessageToPlayers(joinRoomResponse, newPlayer.id);

    this._simulation.startInterval();

    if (this._simulation.players.length === 1) {
      this._simulation.addBots();
    }
  }

  /**
   * Removes a player from the room and the room's simulation.
   *
   * @param socketId the id of the player's socket.
   */
  removePlayer(socketId: number) {
    const player = this._simulation.getNetworkPlayerBySocketId(socketId);
    if (!player) {
      console.error('No player found matching socket: ' + socketId);
      return;
    }
    this._simulation.removePlayer(player.id);
  }

  /**
   * Triggered when a message is received from a client.
   *
   * @param socketId the id of the player's socket.
   * @param message the message the client sent.
   */
  onClientMessage(socketId: number, message: IClientMessage) {
    const player = this._simulation.getNetworkPlayerBySocketId(socketId);
    if (!player) {
      console.error('No player ID found matching socket: ' + socketId);
      return;
    }
    const playerId = player.id;
    //console.log('Room received message from player ' + playerId + ':', message);
    //console.log('Received client message', message);
    if (message.type === ClientMessageType.TOGGLE_CHAT) {
      const isChatting = (message as IClientToggleChatEvent).isChatting;
      player.isChatting = isChatting;
    } else if (message.type === ClientMessageType.BLOCK_MOVED) {
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
          this._simulation.addMessage(clientMessage.message, player, true);
        } else {
          // TODO: simulation addCommand
          if (clientMessage.message.startsWith('/addbot')) {
            const reactionDelay = clientMessage.message.split(' ')[1];
            this._simulation.addBot(
              reactionDelay ? parseInt(reactionDelay) : undefined
            );
          } else if (clientMessage.message.startsWith('/kickbots')) {
            for (const player of this._simulation.players) {
              if (!player.isNetworked) {
                this._simulation.removePlayer(player.id);
              }
            }
          } else if (clientMessage.message.startsWith('/nextround')) {
            this._simulation.round!.end(undefined);
            this._simulation.round!.start();
          } else if (clientMessage.message.startsWith('/endround')) {
            this._simulation.round!.end(undefined);
          } else if (clientMessage.message.startsWith('/spectate')) {
            if (player) {
              player.status =
                player?.status === PlayerStatus.ingame
                  ? PlayerStatus.spectating
                  : this._simulation.shouldNewPlayerSpectate
                  ? PlayerStatus.knockedOut
                  : PlayerStatus.ingame;
            }
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

  onSimulationMessage(
    simulation: ISimulation,
    message: string,
    player: IPlayer | undefined,
    isSynced: boolean
  ) {
    if (isSynced) {
      const simulationMessage: IServerSimulationMessage = {
        message,
        playerId: player?.id,
        type: ServerMessageType.SIMULATION_MESSAGE,
      };

      this._sendMessageToAllPlayers(simulationMessage);
    }
  }

  onNextRound(): void {
    const nextRoundEvent: IServerNextRoundEvent = {
      type: ServerMessageType.NEXT_ROUND,
    };
    this._sendMessageToAllPlayers(nextRoundEvent);
  }

  onEndRound(): void {
    const endRoundEvent: IServerEndRoundEvent = {
      type: ServerMessageType.END_ROUND,
      winnerId: this._simulation.round!.winner?.id,
    };
    this._sendMessageToAllPlayers(endRoundEvent);
  }

  onStartNextRoundTimer(): void {
    const endRoundEvent: IServerStartNextRoundTimerEvent = {
      type: ServerMessageType.START_NEXT_ROUND_TIMER,
    };
    this._sendMessageToAllPlayers(endRoundEvent);
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
    // TODO: instant drops cause a lot of unnecessary movement messages
    /*if (block.isDropping && this._simulation.settings.instantDrops) {
      return;
    }*/
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

  onClearLines(rows: number[], partialClears: PartialClearRow[]): void {
    const clearLinesEvent: IServerClearLinesEvent = {
      type: ServerMessageType.CLEAR_LINES,
      rows,
      partialClears,
    };
    this._sendMessageToAllPlayers(clearLinesEvent);
  }

  onBlockDied(block: IBlock): void {
    const blockDiedEvent: IServerBlockDiedEvent = {
      type: ServerMessageType.BLOCK_DIED,
      playerId: block.player.id,
    };
    this._sendMessageToAllPlayers(blockDiedEvent);
  }
  onBlockDestroyed(block: IBlock): void {
    // const nextSpawnEvent: IServerNextSpawnEvent = {
    //   type: ServerMessageType.NEXT_SPAWN,
    //   time: block.player.estimatedSpawnDelay,
    // };
    // this._sendMessageToPlayers(nextSpawnEvent, block.player.id);
  }

  onPlayerCreated(player: IPlayer) {
    const newPlayerMessage: IServerPlayerCreatedEvent = {
      type: ServerMessageType.PLAYER_CREATED,
      playerInfo: createPlayerInfo(player),
    };

    this._sendMessageToAllPlayersExcept(newPlayerMessage, player.id);
    this._sendServerChatMessage(
      'Player ' + player.nickname + ' joined the game'
    );
  }
  onPlayerDestroyed(player: IPlayer): void {
    const playerDisconnectedMessage: IServerPlayerDisconnectedEvent = {
      type: ServerMessageType.PLAYER_DISCONNECTED,
      playerId: player.id,
    };
    this._sendMessageToAllPlayers(playerDisconnectedMessage);
    if (
      !this._simulation.networkPlayers.filter(
        (otherPlayer) => otherPlayer !== player
      ).length
    ) {
      for (const player of this._simulation.players) {
        if (!player.isNetworked) {
          this._simulation.removePlayer(player.id);
        }
      }
      this._simulation.grid.reset();
      this._simulation.round?.end(undefined);
      this._simulation.stopInterval();
    }
    this._sendServerChatMessage('Player ' + player.nickname + ' left the game');
  }
  onPlayerToggleChat(player: IPlayer): void {
    const playerToggleChatMessage: IServerPlayerToggleChatEvent = {
      type: ServerMessageType.PLAYER_TOGGLE_CHAT,
      playerId: player.id,
      isChatting: player.isChatting,
    };
    this._sendMessageToAllPlayersExcept(playerToggleChatMessage, player.id);
  }
  onPlayerChangeStatus(player: IPlayer): void {
    const playerToggleSpectatingMessage: IServerPlayerChangeStatusEvent = {
      type: ServerMessageType.PLAYER_CHANGE_STATUS,
      playerId: player.id,
      status: player.status,
    };
    this._sendMessageToAllPlayers(playerToggleSpectatingMessage);
  }

  onGameModeEvent(event: GameModeEvent): void {
    if (event.isSynced) {
      const eventMessage: IServerGameModeEvent = {
        data: event,
        type: ServerMessageType.GAME_MODE_EVENT,
      };
      this._sendMessageToAllPlayers(eventMessage);
    }
  }

  onPlayerKilled(_simulation: ISimulation, victim: IPlayer, attacker: IPlayer) {
    const playerKilledMessage: IServerPlayerKilledEvent = {
      type: ServerMessageType.PLAYER_KILLED,
      victimId: victim.id,
      attackerId: attacker.id,
    };
    this._sendMessageToAllPlayers(playerKilledMessage);
  }

  private _sendMessageToAllPlayers(message: IServerMessage) {
    const playerIds: number[] = this._simulation.getNetworkPlayerIds();
    this._sendMessageToPlayers(message, ...playerIds);
  }

  private _sendMessageToAllPlayersExcept(
    message: IServerMessage,
    playerId: number
  ) {
    const playerIds = this._simulation
      .getNetworkPlayerIds()
      .filter((otherPlayerId) => otherPlayerId != playerId);
    this._sendMessageToPlayers(message, ...playerIds);
  }

  private _sendServerChatMessage(message: string) {
    const simulationMessage: IServerSimulationMessage = {
      message: message,
      playerId: undefined,
      type: ServerMessageType.SIMULATION_MESSAGE,
    };

    this._sendMessageToAllPlayers(simulationMessage);
  }

  private _sendMessageToPlayers(
    message: IServerMessage,
    ...playerIds: number[]
  ) {
    for (const playerId of playerIds) {
      const socketId =
        this._simulation.getPlayer<NetworkPlayer>(playerId)?.socketId;
      if (socketId !== undefined) {
        this._sendMessage(message, socketId);
      }
    }
  }
}

function createPlayerInfo(player: IPlayer): NetworkPlayerInfo {
  return {
    color: player.color,
    id: player.id,
    nickname: player.nickname,
    score: player.score,
    status: player.status,
    characterId: player.characterId,
    patternFilename: player.patternFilename,
    health: player.health,
    isBot: player.isBot,
    isNicknameVerified: player.isNicknameVerified,
    isPremium: player.isPremium,
    isFirstBlock: player.isFirstBlock,
    isChatting: player.isChatting,
  };
}
