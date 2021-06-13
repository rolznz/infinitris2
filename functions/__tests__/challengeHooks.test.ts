import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IRating } from 'infinitris2-models';
import firebase from 'firebase';
import { challenge1Path, validChallengeRequest } from './challengeRules.test';
import { ratingId1Path, validRatingRequest } from './ratingRules.test';
import {
  existingUser,
  userId1,
  userId1Path as user1Path,
} from './userRules.test';

describe('Challenge Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create challenge', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [user1Path]: existingUser,
        [challenge1Path]: validChallengeRequest,
      },
      false
    );

    await db.doc(ratingId1Path).set(validRatingRequest);

    await test.wrap(onCreateChallenge)(
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
function onCreateChallenge(onCreateChallenge: any) {
  throw new Error('Function not implemented.');
}
