/*import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

describe('Referred By Affiliate Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow creating a referred by affiliate request for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db
        .doc(dummyData.conversion1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toAllow();
  });

  test('should deny creating a referred by affiliate request with invalid parameters', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.referredByAffiliateRequest,
        nonExistentProperty: '5',
      })
    ).toDeny();

    await expect(
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.referredByAffiliateRequest,
        referredByAffiliateId: 123,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.referredByAffiliateRequest,
        referredByAffiliateId: '',
      })
    ).toDeny();
  });

  // FIXME: all these need to be reviewed

  test('should deny creating a conversion when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
    });

    await expect(
      db
        .doc(dummyData.conversion1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should deny creating a conversion for another user', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db
        .doc(dummyData.conversion1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should allow creating a conversion for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db
        .doc(dummyData.conversion1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toAllow();
  });

  test('should not allow creating a conversion with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.referredByAffiliateRequest,
        created: true,
      } as IUserRequest)
    ).toDeny();
  });

  test('should deny updating a conversion', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.conversion1Path]: dummyData.referredByAffiliateRequest,
      }
    );

    await expect(
      db
        .doc(dummyData.conversion1Path)
        .set(dummyData.referredByAffiliateRequest)
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
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.referredByAffiliateRequest,
        requestType: 'unknownRequestType',
      })
    ).toDeny();
  });
});
*/
