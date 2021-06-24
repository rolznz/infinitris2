import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { getUserRequestPath } from 'infinitris2-models';

describe('User Requests Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should deny creating a user request when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
    });

    await expect(
      db
        .doc(dummyData.referredByAffiliateRequestPath)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should deny creating a user request for another user', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db
        .doc(dummyData.referredByAffiliateRequestPath)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should allow creating a user request for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db
        .doc(dummyData.referredByAffiliateRequestPath)
        .set(dummyData.referredByAffiliateRequest)
    ).toAllow();
  });

  test('should deny overwriting a user request for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.referredByAffiliateRequestPath]:
          dummyData.referredByAffiliateRequest,
      }
    );

    await expect(
      db
        .doc(dummyData.referredByAffiliateRequestPath)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should deny creating a user request with invalid parameters', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.referredByAffiliateRequestPath).set({
        ...dummyData.referredByAffiliateRequest,
        nonExistentProperty: '5',
      })
    ).toDeny();

    await expect(
      db.doc(dummyData.referredByAffiliateRequestPath).set({
        ...dummyData.referredByAffiliateRequest,
        referredByAffiliateId: 123,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.referredByAffiliateRequestPath).set({
        ...dummyData.referredByAffiliateRequest,
        referredByAffiliateId: '',
      })
    ).toDeny();
  });

  test('should deny creating an unsupported request', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db
        .doc(
          getUserRequestPath(dummyData.userId1, 'referredByAffiliate2' as any)
        )
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });
});

/* ('nickname should meet requirements', async () => {
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
