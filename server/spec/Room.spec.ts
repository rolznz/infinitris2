import 'jasmine';
import 'module-alias/register';
import Room from '@src/Room';
import IJoinRoomResponse, {
  JoinRoomResponseStatus,
} from '@core/networking/server/IJoinRoomResponse';
import ServerMessageType from '@core/networking/server/ServerMessageType';
import IPlayerConnectedEvent from '@core/networking/server/IPlayerConnectedEvent';
import { ValidServerMessage } from '@src/networking/IServerSocket';

describe('Room', () => {
  it('will add players to the simulation', () => {
    // tslint:disable-next-line: no-empty
    const sendMessage = (
      message: ValidServerMessage,
      ...socketIds: number[]
    ) => {};
    const room = new Room(sendMessage);
    const playerId = 1;
    room.addPlayer(playerId);
    expect(room.simulation.getPlayerIds()).toEqual([playerId]);
  });

  it('will send correct messages when the first player joins', () => {
    const playerId = 1;

    const joinRoomResponseMessage: IJoinRoomResponse = {
      data: { playerId, status: JoinRoomResponseStatus.OK },
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
    };

    const playerConnectedEventMessage: IPlayerConnectedEvent = {
      playerId,
      type: ServerMessageType.PLAYER_CONNECTED,
    };

    const expectedMessages: Array<{
      message: ValidServerMessage;
      socketIds: number[];
    }> = [
      { message: joinRoomResponseMessage, socketIds: [playerId] },
      { message: playerConnectedEventMessage, socketIds: [] },
    ];

    const receivedMessages: Array<{
      message: ValidServerMessage;
      socketIds: number[];
    }> = [];
    const sendMessage = (
      message: ValidServerMessage,
      ...socketIds: number[]
    ) => {
      receivedMessages.push({ message, socketIds });
    };
    const room = new Room(sendMessage);
    room.addPlayer(playerId);
    expect(receivedMessages).toEqual(expectedMessages);
  });
});
