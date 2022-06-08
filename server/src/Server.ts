require('dotenv').config();
import ServerSocket from './networking/ServerSocket';
import Room from './Room';
import IServerSocketEventListener from './networking/IServerSocketEventListener';
import IClientSocket from './networking/IClientSocket';
import IServerSocket from './networking/IServerSocket';
import { IClientMessage } from '@models/networking/client/IClientMessage';
import { ClientMessageType } from '@models/networking/client/ClientMessageType';
import IClientJoinRoomRequest from '@core/networking/client/IClientJoinRoomRequest';
import { getCharacters } from './firebase';
import { ICharacter } from '@models/ICharacter';
import { cachedGet } from '@src/util/cachedGet';
import { UpdateServerRequest } from '@models/UpdateServerRequest';
import got from 'got';
import { PlayerStatus } from '@models/IPlayer';
import IRoom from '@models/IRoom';
import { GameModeTypeValues } from '@models/GameModeType';
import { IServer } from '@models/IServer';
import { IServerMessage } from '@models/networking/server/IServerMessage';
import {
  IServerJoinRoomResponse,
  JoinRoomResponseStatus,
} from '@core/networking/server/IServerJoinRoomResponse';
import { ServerMessageType } from '@models/networking/server/ServerMessageType';
import { NETWORK_VERSION } from '@models/index';

export const apiUrl = process.env.API_URL;
export default class Server implements IServerSocketEventListener {
  private _socket: IServerSocket;
  private _rooms: { [id: number]: Room };
  private _sendServerMessage: (
    message: IServerMessage,
    ...socketIds: number[]
  ) => void;

  constructor(socket: IServerSocket) {
    this._socket = socket;
    this._socket.addEventListener(this);
    this._sendServerMessage = this._socket.sendMessage.bind(this._socket);
    this._rooms = {};
    this._init();
  }

  private async _init() {
    const time = Date.now();
    const characters = await cachedGet<ICharacter[] | undefined>(
      'characters',
      getCharacters
    );
    console.log(
      'Retrieved ' +
        characters?.length +
        ' characters in ' +
        (Date.now() - time) +
        'ms'
    );
    // TODO: these should come from .env config

    for (let i = 0; ; i++) {
      let roomInfoJson = process.env[`ROOM_${i}`];
      if (!roomInfoJson) {
        if (i < GameModeTypeValues.length) {
          roomInfoJson = JSON.stringify({
            name: 'Room ' + i,
            gameModeType: GameModeTypeValues[i],
          } as IRoom);
        } else {
          break;
        }
      }
      const roomInfo: IRoom = JSON.parse(roomInfoJson);
      this._rooms[i] = new Room(this._sendServerMessage, roomInfo, characters);
    }

    this._updateLobby();
  }

  /**
   * Retrieves the rooms currently running within the server.
   */
  get rooms(): { [id: number]: Room } {
    return this._rooms;
  }

  /**
   * @inheritdoc
   */
  onClientConnect(socket: IClientSocket) {
    console.log('Client ' + socket.id + ' connected');
  }

  /**
   * @inheritdoc
   */
  onClientDisconnect(socket: IClientSocket) {
    console.log('Client ' + socket.id + ' disconnected');
    if (socket.roomIndex !== undefined) {
      this._rooms[socket.roomIndex].removePlayer(socket.id);
      this._updateLobby(socket.roomIndex);
    }
  }

  /**
   * @inheritdoc
   */
  onClientMessage(socket: IClientSocket, message: IClientMessage) {
    console.log(
      'Received message from client ' + socket.id + ':',
      message.type + ' room: ' + socket.roomIndex
    );
    try {
      if (socket.roomIndex === undefined) {
        if (message.type === ClientMessageType.JOIN_ROOM_REQUEST) {
          const joinRoomRequest = message as IClientJoinRoomRequest;

          const room = this._rooms[joinRoomRequest.roomIndex];
          const isFull =
            room && room.simulation.players.length > room.info.maxPlayers;
          const matchingVersion =
            joinRoomRequest.networkVersion === NETWORK_VERSION;
          console.log('Join room request from ' + socket.id, joinRoomRequest);
          if (!room || isFull || !matchingVersion) {
            const joinRoomResponse: IServerJoinRoomResponse = {
              type: ServerMessageType.JOIN_ROOM_RESPONSE,
              data: {
                status: isFull
                  ? JoinRoomResponseStatus.FULL
                  : !matchingVersion
                  ? JoinRoomResponseStatus.INCORRECT_VERSION
                  : JoinRoomResponseStatus.NOT_READY,
              },
            };
            console.log(
              'Deny room request from ' + socket.id,
              joinRoomResponse
            );
            this._sendServerMessage(joinRoomResponse, socket.id);
          } else {
            socket.roomIndex = joinRoomRequest.roomIndex;
            room.addPlayer(socket.id, joinRoomRequest.player);
            this._updateLobby(socket.roomIndex);
            console.log(
              'Client ' + socket.id + ' joined room ' + socket.roomIndex
            );
          }
        } else {
          console.error(
            'Unsupported message received from ' +
              socket.id +
              ': ' +
              message.type
          );
        }
      } else if (socket.roomIndex !== undefined) {
        this._rooms[socket.roomIndex].onClientMessage(socket.id, message);
      }
    } catch (error) {
      console.error(
        'Error in onClientMessage(' + socket.id + ')',
        message,
        error
      );
    }
  }

  private async _updateLobby(roomIndex?: number) {
    const serverId = process.env.SERVER_ID;
    if (!serverId) {
      console.log('No SERVER_ID set, not updating lobby server');
      return;
    }
    const serverKey = process.env.SERVER_SECRET_KEY;
    if (!serverKey) {
      console.log('No SERVER_SECRET_KEY set, not updating lobby server');
      return;
    }
    if (!apiUrl) {
      console.log('No API_URL set, not updating lobby server');
      return;
    }

    const serverInfoJson = process.env[`SERVER`];
    if (!serverInfoJson) {
      console.log('No SERVER set, not updating lobby server');
      return;
    }
    const serverInfo: IServer = JSON.parse(serverInfoJson);

    const request: UpdateServerRequest = {
      server: roomIndex
        ? undefined
        : {
            ...serverInfo,
            created: true,
            version: NETWORK_VERSION,
          },
      rooms: Object.entries(this._rooms)
        .filter((entry) => !roomIndex || parseInt(entry[0]) === roomIndex)
        .map((entry) => {
          const roomIndex = parseInt(entry[0]);
          const room = entry[1];
          return {
            created: true,
            maxPlayers: 12,
            name: room.info.name,
            gameModeType: room.info.gameModeType,
            numPlayers: room.simulation.players.length,
            numHumans: room.simulation.humanPlayers.length,
            numBots: room.simulation.players.filter((player) => player.isBot)
              .length,
            numSpectators: room.simulation.players.filter(
              (player) => player.status === PlayerStatus.spectating
            ).length,
            roomIndex,
            serverId,
            worldType: room.info.worldType,
            worldVariation: room.info.worldVariation,
          };
        }),
      serverKey,
    };

    console.log('Updating server in lobby: ', request);
    const response = await got.patch(`${apiUrl}/servers/${serverId}`, {
      json: request,
    });
    if (response.statusCode === 204) {
      console.error('Updated server in lobby');
    } else {
      console.error(
        'Failed to update server in lobby: ' +
          response.statusCode +
          ' ' +
          response.statusMessage
      );
    }
  }
}

// entry point
if (process.argv[process.argv.length - 1] === 'launch') {
  (() => {
    if (!process.env.HOST || !process.env.PORT) {
      throw new Error('HOST or PORT not specified in .env');
    }
    console.log(`Starting server at ${process.env.HOST}:${process.env.PORT}`);
    new Server(new ServerSocket(process.env.HOST, parseInt(process.env.PORT)));
  })();
}
