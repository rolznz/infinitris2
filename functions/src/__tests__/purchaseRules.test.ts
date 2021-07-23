import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
//import { getPurchasePath } from 'infinitris2-models';

describe('Purchase Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  // TODO: fix this test with valid purchase, color must be less than 3 credits
  // Firestore rules

  test('should allow creating a purchase when logged in with sufficient coins', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.color1Path]: dummyData.color1,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.purchase1)
    ).toAllow();
  });

  // TODO: test cannot purchase greater than entity price
  // TODO: test cannot purchase non-existent entity
  // TODO: test cannot update purchase

  /*test('should deny creating a purchase when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
    });

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.creatablePurchase)
    ).toDeny();
  });

  test('should deny updating an existing purchase object', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.purchase1Path]: dummyData.creatablePurchase,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.creatablePurchase)
    ).toDeny();
  });

  test('should deny creating a purchase request with invalid purchase', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    const invalidPurchases = [
      '######', // invalid character
      'a', // must be at least 2 chars
      'a'.repeat(16), // must be less than 16 chars
    ];
    for (const purchaseId of invalidPurchases) {
      await expect(
        db.doc(getPurchasePath(purchaseId)).set(dummyData.creatablePurchase)
      ).toDeny();
    }
  });*/
});
