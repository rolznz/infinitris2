import { setup } from './helpers/setup';
import './helpers/extensions';
import {
  IRoom,
  IServer,
  IServerKey,
  UpdateServerRequest,
} from 'infinitris2-models';
import { webhooksExpressApp } from '..';
import * as request from 'supertest';
import dummyData from './helpers/dummyData';

test('update server webhook', async () => {
  const { db } = await setup(
    undefined,
    {
      [dummyData.server1Path]: dummyData.server1,
      [dummyData.serverKey1Path]: dummyData.serverKey1,
      [dummyData.room1Path]: dummyData.room1,
    },
    false
  );

  const updateServerRequest: UpdateServerRequest = {
    server: {
      ...dummyData.server1,
      name: dummyData.server1.name + '1',
    },
    rooms: [
      {
        ...dummyData.room1,
        numPlayers: dummyData.room1.numPlayers + 1,
      },
    ],
    serverKey: dummyData.serverKey1Id,
  };

  await request(webhooksExpressApp)
    .patch(`/v1/servers/${dummyData.server1Id}`)
    .send(updateServerRequest)
    .expect(204);

  const serverData = (
    await db.doc(dummyData.server1Path).get()
  ).data() as IServer;
  expect(serverData.name).toBe(updateServerRequest.server.name);
  const roomData = (await db.doc(dummyData.room1Path).get()).data() as IRoom;
  expect(roomData.numPlayers).toBe(updateServerRequest.rooms[0].numPlayers);
});

test('update server webhook with non existent server key returns not found', async () => {
  const { db } = await setup(
    undefined,
    {
      [dummyData.server1Path]: dummyData.server1,
      [dummyData.serverKey1Path]: dummyData.serverKey1,
      [dummyData.room1Path]: dummyData.room1,
    },
    false
  );

  const updateServerRequest: UpdateServerRequest = {
    server: dummyData.server1,
    rooms: [dummyData.room1],
    serverKey: dummyData.serverKey1Id + 'x',
  };

  await request(webhooksExpressApp)
    .patch(`/v1/servers/${dummyData.server1Id}`)
    .send(updateServerRequest)
    .expect(404);

  const serverData = (
    await db.doc(dummyData.server1Path).get()
  ).data() as IServer;
  expect(serverData.name).toBe(dummyData.server1.name);
  const roomData = (await db.doc(dummyData.room1Path).get()).data() as IRoom;
  expect(roomData.numPlayers).toBe(dummyData.room1.numPlayers);
});

test('update server webhook for server ID not matching server key returns unauthorized', async () => {
  const { db } = await setup(
    undefined,
    {
      [dummyData.server1Path]: dummyData.server1,
      [dummyData.serverKey1Path]: {
        ...dummyData.serverKey1,
        serverId: dummyData.serverKey1.serverId + '1',
      } as IServerKey,
      [dummyData.room1Path]: dummyData.room1,
    },
    false
  );

  const updateServerRequest: UpdateServerRequest = {
    server: dummyData.server1,
    rooms: [dummyData.room1],
    serverKey: dummyData.serverKey1Id,
  };

  await request(webhooksExpressApp)
    .patch(`/v1/servers/${dummyData.server1Id}`)
    .send(updateServerRequest)
    .expect(401);

  const serverData = (
    await db.doc(dummyData.server1Path).get()
  ).data() as IServer;
  expect(serverData.name).toBe(dummyData.server1.name);
  const roomData = (await db.doc(dummyData.room1Path).get()).data() as IRoom;
  expect(roomData.numPlayers).toBe(dummyData.room1.numPlayers);
});

test('update server webhook with room for different server returns bad request', async () => {
  const { db } = await setup(
    undefined,
    {
      [dummyData.server1Path]: dummyData.server1,
      [dummyData.serverKey1Path]: dummyData.serverKey1,
      [dummyData.room1Path]: dummyData.room1,
    },
    false
  );

  const updateServerRequest: UpdateServerRequest = {
    server: dummyData.server1,
    rooms: [
      {
        ...dummyData.room1,
        serverId: dummyData.server1Id + '1',
      },
    ],
    serverKey: dummyData.serverKey1Id,
  };

  await request(webhooksExpressApp)
    .patch(`/v1/servers/${dummyData.server1Id}`)
    .send(updateServerRequest)
    .expect(400);

  const serverData = (
    await db.doc(dummyData.server1Path).get()
  ).data() as IServer;
  expect(serverData.name).toBe(dummyData.server1.name);
  const roomData = (await db.doc(dummyData.room1Path).get()).data() as IRoom;
  expect(roomData.numPlayers).toBe(dummyData.room1.numPlayers);
});
