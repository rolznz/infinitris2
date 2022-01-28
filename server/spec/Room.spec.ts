import 'jasmine';
import 'module-alias/register';
import Room from '@src/Room';
import { ServerMessage } from '@src/networking/IServerSocket';

describe('Room', () => {
  it('will add players to the simulation', () => {
    const sendMessage = (message: ServerMessage, ...socketIds: number[]) => {};
    const room = new Room(sendMessage, 'infinity');
    const playerId = 1;
    room.addPlayer(playerId);
    expect(room.simulation.getPlayerIds()).toEqual([playerId]);
  });

  it('will send correct messages when the first player joins', () => {
    /*const playerId = 1;

    const joinRoomResponseMessage: IServerJoinRoomResponse = {
      data: { playerId, status: JoinRoomResponseStatus.OK, },
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
    };

    const playerConnectedEventMessage: IPlayerConnectedEvent = {
      playerId,
      type: ServerMessageType.PLAYER_CONNECTED,
    };

    const expectedMessages: Array<{
      message: ServerMessage;
      socketIds: number[];
    }> = [
      { message: joinRoomResponseMessage, socketIds: [playerId] },
      { message: playerConnectedEventMessage, socketIds: [] },
    ];

    const receivedMessages: Array<{
      message: ServerMessage;
      socketIds: number[];
    }> = [];
    const sendMessage = (message: ServerMessage, ...socketIds: number[]) => {
      receivedMessages.push({ message, socketIds });
    };
    const room = new Room(sendMessage);
    room.addPlayer(playerId);
    expect(receivedMessages).toEqual(expectedMessages);*/
    expect(true).toBe(false);
  });
});
