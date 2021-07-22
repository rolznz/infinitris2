import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { getNicknamePath } from '../../../models/dist';

describe('Nickname Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow creating a nickname', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    const validNicknames = ['Big Ben 123', 'AL', 'a'.repeat(15)];

    for (const nicknameId of validNicknames) {
      await expect(
        db.doc(getNicknamePath(nicknameId)).set(dummyData.creatableNickname)
      ).toAllow();
    }
  });

  test('should deny creating a nickname when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
    });

    await expect(
      db.doc(dummyData.nickname1Path).set(dummyData.creatableNickname)
    ).toDeny();
  });

  test('should deny updating an existing nickname object', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.nickname1Path]: dummyData.creatableNickname,
      }
    );

    await expect(
      db.doc(dummyData.nickname1Path).set(dummyData.creatableNickname)
    ).toDeny();
  });

  test('should deny creating a nickname request with invalid nickname', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    const invalidNicknames = [
      '######', // invalid character
      'a', // must be at least 2 chars
      'a'.repeat(16), // must be less than 16 chars
    ];
    for (const nicknameId of invalidNicknames) {
      await expect(
        db.doc(getNicknamePath(nicknameId)).set(dummyData.creatableNickname)
      ).toDeny();
    }
  });
});
