import { setup, teardown } from './helpers/setup';
require('./helpers/extensions.ts');
import { serverKeysPath } from 'infinitris2-models';
import dummyData from './helpers/dummyData';

describe('Server Key Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should deny reading server keys', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.serverKey1Path]: dummyData.serverKey1,
      }
    );

    await expect(db.doc(dummyData.serverKey1Path).get()).toDeny();
    await expect(db.collection(serverKeysPath).get()).toDeny();
  });
});
