import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IUser } from 'infinitris2-models';
import firebase from 'firebase';
import { challenge1Path, validChallengeRequest } from './challengeRules.test';
import {
  existingUser,
  userId1,
  userId1Path as user1Path,
} from './userRules.test';
import { onCreateChallenge } from '../onCreateChallenge';

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

    await test.wrap(onCreateChallenge)(
      test.firestore.makeDocumentSnapshot(
        validChallengeRequest,
        challenge1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: userId1 }),
      }
    );

    const challenge = (await db.doc(challenge1Path).get()).data() as IChallenge;
    expect(challenge.readOnly.userId).toBe(userId1);
    expect(challenge.readOnly.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );
    expect(challenge.readOnly.numRatings).toBe(0);
    expect(challenge.readOnly.summedRating).toBe(0);
    expect(challenge.readOnly.rating).toBe(0);

    const user = (await db.doc(user1Path).get()).data() as IUser;
    expect(user.readOnly.credits).toEqual(2);
  });
});
