import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IRating } from 'infinitris2-models';
import firebase from 'firebase';
import {
  challenge1Path,
  existingPublishedChallenge,
} from './challengeRules.test';
import { ratingId1Path, validRatingRequest } from './ratingRules.test';
import { onCreateRating } from '../src/onCreateRating';
import { userId1 } from './userRules.test';

describe('Rating Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create rating', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [challenge1Path]: existingPublishedChallenge,
      },
      false
    );

    await db.doc(ratingId1Path).set(validRatingRequest);

    await test.wrap(onCreateRating)(
      test.firestore.makeDocumentSnapshot(validRatingRequest, ratingId1Path),
      {
        auth: test.auth.makeUserRecord({ uid: userId1 }),
      }
    );

    const rating = (await db.doc(ratingId1Path).get()).data() as IRating;

    expect(rating.readOnly.userId).toBe(userId1);
    expect(rating.readOnly.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    const challenge = (await db.doc(challenge1Path).get()).data() as IChallenge;
    expect(challenge.readOnly.numRatings).toBe(1);
    expect(challenge.readOnly.summedRating).toBe(rating.value);
    expect(challenge.readOnly.rating).toBe(rating.value);
  });
});
