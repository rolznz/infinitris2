import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

import { getConversionPath, IUser } from 'infinitris2-models';

describe('Conversion Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow creating a conversion for an affiliate', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set(dummyData.conversion1)
    ).toAllow();
  });

  test('should deny creating a conversion for another user', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set(dummyData.conversion1)
    ).toDeny();
  });

  test('should deny creating a conversion for own affiliate', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user2Path]: dummyData.existingUser,
      }
    );

    const conversionPath = getConversionPath(
      dummyData.affiliateId1,
      dummyData.userId2
    );

    await expect(db.doc(conversionPath).set(dummyData.conversion1)).toDeny();
  });

  test('should deny creating a conversion for non-existent affiliate', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    const conversionPath = getConversionPath('nonexistent', dummyData.userId1);

    await expect(db.doc(conversionPath).set(dummyData.conversion1)).toDeny();
  });

  test('should deny creating a conversion for an already converted user', async () => {
    const user1: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        referredByAffiliateId: dummyData.affiliateId1,
      },
    };

    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: user1,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set(dummyData.conversion1)
    ).toDeny();
  });

  test('should deny creating a conversion with invalid parameters', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.conversion1,
        nonExistentParameter: 1,
      })
    ).toDeny();
  });

  test('should deny creating a conversion with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.conversion1Path).set({
        ...dummyData.conversion1,
        created: true,
      })
    ).toDeny();
  });
});
