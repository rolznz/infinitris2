import { setup, teardown } from './helpers/setup';
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
        .doc(dummyData.userRequest1Path)
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
});
