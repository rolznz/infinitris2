import Server from '@server/Server';
import NetworkClient from '@client/client/NetworkClient';
import ClientMessageType from '@core/networking/client/ClientMessageType';
import ServerMessageType from '@core/networking/server/ServerMessageType';
import {
  IJoinRoomResponse,
  JoinRoomResponseStatus,
} from '@core/networking/server/IJoinRoomResponse';
import FakeServerSocket from './support/FakeServerSocket';
import FakeClientSocket from './support/FakeClientSocket';

Object.values = (obj: any) => Object.keys(obj).map((key) => obj[parseInt(key)]);

describe('Index', () => {
  it('client can connect and disconnect from a server', () => {
    const fakeServerSocket = new FakeServerSocket();
    const fakeClientSocket = new FakeClientSocket();

    const server = new Server(fakeServerSocket);
    const client = new NetworkClient(fakeClientSocket);

    const clientOnConnectSpy = spyOn(client, 'onConnect').and.callThrough();
    const clientOnDisconnectSpy = spyOn(
      client,
      'onDisconnect'
    ).and.callThrough();
    const clientOnMessageSpy = spyOn(client, 'onMessage').and.callThrough();

    const serverOnClientConnectSpy = spyOn(
      server,
      'onClientConnect'
    ).and.callThrough();
    const serverOnClientDisconnectSpy = spyOn(
      server,
      'onClientDisconnect'
    ).and.callThrough();
    const serverOnClientMessageSpy = spyOn(
      server,
      'onClientMessage'
    ).and.callThrough();

    // connection event
    fakeServerSocket.onClientConnect(fakeClientSocket);
    fakeClientSocket.connectTo(fakeServerSocket);

    const expectedJoinRoomRequest = {
      type: ClientMessageType.JOIN_ROOM_REQUEST,
    };

    // TODO: Receive other players and grid data
    const expectedJoinRoomResponse: IJoinRoomResponse = {
      type: ServerMessageType.JOIN_ROOM_RESPONSE,
      data: {
        status: JoinRoomResponseStatus.OK,
        playerId: fakeClientSocket.id,
      },
    };

    expect(fakeClientSocket.id).toEqual(0);
    expect(fakeClientSocket.roomId).toEqual(0);
    expect(clientOnConnectSpy).toHaveBeenCalled();
    expect(serverOnClientConnectSpy).toHaveBeenCalledWith(fakeClientSocket);

    expect(serverOnClientMessageSpy).toHaveBeenCalledWith(
      fakeClientSocket,
      expectedJoinRoomRequest
    );
    expect(clientOnMessageSpy).toHaveBeenCalledWith(expectedJoinRoomResponse);

    fakeClientSocket.onDisconnect();
    expect(clientOnDisconnectSpy).toHaveBeenCalled();

    fakeServerSocket.onClientDisconnect(fakeClientSocket);
    expect(serverOnClientDisconnectSpy).toHaveBeenCalledWith(fakeClientSocket);
  });
});
