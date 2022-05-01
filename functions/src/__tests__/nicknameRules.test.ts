import { setup, teardown } from './helpers/setup';
require('./helpers/extensions.ts');
import { getNicknamePath, INickname } from 'infinitris2-models';
import dummyData from './helpers/dummyData';

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

    const validNicknames = ['big ben 123', 'al', 'a'.repeat(15)];

    for (const nicknameId of validNicknames) {
      await expect(
        db.doc(getNicknamePath(nicknameId)).set(dummyData.creatableNickname)
      ).toAllow();
    }
  });

  test('should deny creating a nickname with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    const nickname: INickname = {
      ...dummyData.creatableNickname,
      created: true,
    };

    await expect(db.doc(getNicknamePath('Test')).set(nickname)).toDeny();
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
      'Aa', // capitals not allowed
      'a'.repeat(16), // must be less than 16 chars
    ];
    for (const nicknameId of invalidNicknames) {
      await expect(
        db.doc(getNicknamePath(nicknameId)).set(dummyData.creatableNickname)
      ).toDeny();
    }
  });

  test('should deny creating a nickname with invalid property', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.nickname1Path).set({
        ...dummyData.creatableNickname,
        nonExistentProperty: 5,
      })
    ).toDeny();
  });
});
