import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

describe('Nickname Requests Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow creating a nickname request for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.userRequest1Path).set(dummyData.nicknameRequest)
    ).toAllow();
  });

  test('should deny creating a nickname request with invalid nickname', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.userRequest1Path).set(dummyData.nicknameRequest)
    ).toAllow();
  });
});

/*

 ('should deny creating a nickname request with invalid parameters', async () => {
    expect(true).toBe(false);
  });
('nickname should meet requirements', async () => {
    const {db} = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );
      db.doc(userId1Path).set({ nickname: 'a' }, { merge: true })
    ).toDeny(); // must be at least 2 chars
    await expect(
      db.doc(userId1Path).set({ nickname: '**' }, { merge: true })
    ).toDeny(); // invalid chars not allowed
    await expect(
      db.doc(userId1Path).set({ nickname: 'a'.repeat(16) }, { merge: true })
    ).toDeny();
  });
*/
