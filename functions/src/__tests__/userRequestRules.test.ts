import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

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
        .doc(dummyData.userRequest1Path)
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
        .doc(dummyData.userRequest1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should allow creating a user request for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db
        .doc(dummyData.userRequest1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toAllow();
  });

  test('should deny updating a user request', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.userRequest1Path]: dummyData.referredByAffiliateRequest,
      }
    );

    await expect(
      db
        .doc(dummyData.userRequest1Path)
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
      db.doc(dummyData.userRequest1Path).set({
        ...dummyData.referredByAffiliateRequest,
        nonExistentProperty: '5',
      })
    ).toDeny();

    await expect(
      db.doc(dummyData.userRequest1Path).set({
        ...dummyData.referredByAffiliateRequest,
        referredByAffiliateId: 123,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.userRequest1Path).set({
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
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db.doc(dummyData.userRequest1Path).set({
        ...dummyData.referredByAffiliateRequest,
        requestType: 'unknownRequestType',
      })
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
