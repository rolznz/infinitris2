import { getRoomPath, IRoom, roomsPath } from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';

const roomId1 = 'roomId1';

const validRoom: Partial<IRoom> = {
  name: 'Test room',
};

describe('Rooms Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow reading the rooms collection', async () => {
    const { db } = await setup();

    await expect(db.collection(roomsPath).get()).toAllow();
  });

  test('should allow reading a room', async () => {
    const { db } = await setup();

    await expect(db.doc(getRoomPath(roomId1)).get()).toAllow();
  });

  test('should deny creating a room', async () => {
    const { db } = await setup();

    await expect(db.doc(getRoomPath(roomId1)).set(validRoom)).toDeny();
  });
});
