import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { ICharacter, IPurchase } from 'infinitris2-models';

describe('Purchase Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow creating a purchase when logged in with sufficient coins', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.character1Path]: dummyData.character1,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.purchase1)
    ).toAllow();
  });

  test('should deny creating a purchase when character is out of stock', async () => {
    const character: ICharacter = {
      ...dummyData.character1,
      maxPurchases: 0,
    };
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.character1Path]: character,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.purchase1)
    ).toDeny();
  });

  test('should deny creating a purchase with insufficient coins', async () => {
    const character: ICharacter = {
      ...dummyData.character1,
      price: dummyData.existingUser.readOnly.coins + 1,
    };
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.character1Path]: character,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.purchase1)
    ).toDeny();
  });

  test('should allow creating a purchase when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
      [dummyData.character1Path]: dummyData.character1,
    });

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.purchase1)
    ).toDeny();
  });

  test('should deny creating a purchase for non-existent entity', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set(dummyData.purchase1)
    ).toDeny();
  });

  test('should deny updating a purchase', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.character1Path]: dummyData.character1,
        [dummyData.purchase1Path]: dummyData.purchase1,
      }
    );

    await expect(db.doc(dummyData.purchase1Path).set({})).toDeny();
  });

  test('should deny creating a purchase with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.character1Path]: dummyData.character1,
      }
    );

    const purchase: IPurchase = {
      ...dummyData.purchase1,
      created: true,
    };

    await expect(db.doc(dummyData.purchase1Path).set(purchase)).toDeny();
  });

  test('should deny creating a purchase with invalid property', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.character1Path]: dummyData.character1,
      }
    );

    await expect(
      db.doc(dummyData.purchase1Path).set({
        ...dummyData.purchase1,
        nonExistentProperty: 1,
      })
    ).toDeny();
  });
});
