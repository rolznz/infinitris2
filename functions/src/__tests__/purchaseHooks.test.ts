import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { ICharacter, IPurchase, IUser } from 'infinitris2-models';
import { firestore } from '@firebase/rules-unit-testing';
import { onCreatePurchase } from '../onCreatePurchase';

describe('Purchase Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('can purchase a character', async () => {
    // assume the user already has one purchase
    const existingUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        characterIds: [dummyData.characterId2.toString()],
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.user1Path]: existingUser,
        [dummyData.character1Path]: dummyData.character1,
        [dummyData.purchase1Path]: dummyData.purchase1,
      },
      false
    );

    await test.wrap(onCreatePurchase)(
      test.firestore.makeDocumentSnapshot(
        dummyData.purchase1,
        dummyData.purchase1Path
      )
    );

    const purchase = (
      await db.doc(dummyData.purchase1Path).get()
    ).data() as IPurchase;

    expect(purchase.userId).toBe(dummyData.userId1);
    expect(purchase.created).toBe(true);
    expect(purchase.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firestore.Timestamp.now().seconds - 5
    );

    const character = (
      await db.doc(dummyData.character1Path).get()
    ).data() as ICharacter;
    expect(character.numPurchases).toBe(1);

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    expect(user.readOnly.coins).toEqual(0);
    expect(user.readOnly.characterIds).toEqual([
      dummyData.characterId2.toString(),
      dummyData.characterId1.toString(),
    ]);
  });
});
