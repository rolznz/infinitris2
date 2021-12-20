import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IUser } from 'infinitris2-models';
import { onCreateChallenge } from '../onCreateChallenge';
import dummyData from './helpers/dummyData';
import { firestore } from '@firebase/rules-unit-testing';

describe('Challenge Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create challenge', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.creatableChallenge,
      },
      false
    );

    await test.wrap(onCreateChallenge)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableChallenge,
        dummyData.challenge1Path
      )
    );

    const challenge = (
      await db.doc(dummyData.challenge1Path).get()
    ).data() as IChallenge;
    expect(challenge.created).toBe(true);
    expect(challenge.userId).toBe(dummyData.userId1);
    expect(challenge.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firestore.Timestamp.now().seconds - 5
    );
    expect(challenge.readOnly!.numRatings).toBe(0);
    expect(challenge.readOnly!.summedRating).toBe(0);
    expect(challenge.readOnly!.rating).toBe(0);

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    expect(user.readOnly.coins).toEqual(2);
  });
});
