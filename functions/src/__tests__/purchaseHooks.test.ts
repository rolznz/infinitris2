import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { IColor, IPurchase, IUser } from 'infinitris2-models';
import { onCreatePurchase } from '../onCreatePurchase';
import firebase from 'firebase';

describe('Purchase Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('can purchase a color', async () => {
    // assume the user already has one purchase
    const existingUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        purchasedEntityIds: [dummyData.colorId2],
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.user1Path]: existingUser,
        [dummyData.color1Path]: dummyData.color1,
        [dummyData.purchase1Path]: dummyData.purchase1,
      },
      false
    );

    await test.wrap(onCreatePurchase)(
      test.firestore.makeDocumentSnapshot(
        dummyData.purchase1,
        dummyData.purchase1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
      }
    );

    const purchase = (
      await db.doc(dummyData.purchase1Path).get()
    ).data() as IPurchase;

    expect(purchase.readOnly!.userId).toBe(dummyData.userId1);
    expect(purchase.created).toBe(true);
    expect(purchase.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    const color = (await db.doc(dummyData.color1Path).get()).data() as IColor;
    expect(color.readOnly!.numPurchases).toBe(1);

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    expect(user.readOnly.coins).toEqual(0);
    expect(user.readOnly.purchasedEntityIds).toEqual([
      dummyData.colorId2,
      dummyData.colorId1,
    ]);
  });
});
