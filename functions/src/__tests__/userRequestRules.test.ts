import { teardown } from './helpers/setup';
import './helpers/extensions';

describe('Users Requests Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('placeholder', () => {
    expect(0).toEqual(0);
  });
});

/*test('nickname should meet requirements', async () => {
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
