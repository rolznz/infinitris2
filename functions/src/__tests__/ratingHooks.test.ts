import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import {
  CreatableRating,
  IChallenge,
  IRating,
  IUser,
} from 'infinitris2-models';
import { onCreateRating } from '../onCreateRating';
import dummyData from './helpers/dummyData';
import { firestore } from '@firebase/rules-unit-testing';

describe('Rating Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('can create rating for a challenge created by someone else', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.rating1Path]: dummyData.creatableRating,
      },
      false
    );

    await test.wrap(onCreateRating)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableRating,
        dummyData.rating1Path
      )
    );

    const rating = (
      await db.doc(dummyData.rating1Path).get()
    ).data() as IRating;

    expect(rating.userId).toBe(dummyData.userId2);
    expect(rating.created).toBe(true);
    expect(rating.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firestore.Timestamp.now().seconds - 5
    );

    const challenge = (
      await db.doc(dummyData.challenge1Path).get()
    ).data() as IChallenge;
    expect(challenge.readOnly?.numRatings).toBe(1);
    expect(challenge.readOnly?.summedRating).toBe(rating.value);
    expect(challenge.readOnly?.rating).toBe(rating.value);

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;

    // network impact user 2 => user 1
    expect(user.readOnly.networkImpact).toEqual(1);
  });

  test('rating < 3 will not create network impact', async () => {
    const ratingRequest: CreatableRating = {
      ...dummyData.creatableRating,
      value: 2,
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.rating1Path]: ratingRequest,
      },
      false
    );

    await test.wrap(onCreateRating)(
      test.firestore.makeDocumentSnapshot(ratingRequest, dummyData.rating1Path)
    );

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    expect(user.readOnly.networkImpact).toEqual(0);
  });
});
