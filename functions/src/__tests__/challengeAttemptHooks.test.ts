import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IChallengeAttempt } from 'infinitris2-models';
import firebase from 'firebase';
import dummyData from './helpers/dummyData';
import { onCreateChallengeAttempt } from '../onCreateChallengeAttempt';

describe('Challenge Attempt Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create challenge attempt', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.challengeAttempt1Path]: dummyData.creatableChallengeAttempt,
      },
      false
    );

    await test.wrap(onCreateChallengeAttempt)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableChallengeAttempt,
        dummyData.challengeAttempt1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
      }
    );

    const challenge = (
      await db.doc(dummyData.challenge1Path).get()
    ).data() as IChallenge;
    expect(challenge.readOnly!.numAttempts).toBe(1);

    const challengeAttempt = (
      await db.doc(dummyData.challengeAttempt1Path).get()
    ).data() as IChallengeAttempt;
    expect(challengeAttempt.created).toBe(true);
    expect(challengeAttempt.readOnly!.userId).toBe(dummyData.userId1);
    expect(
      challengeAttempt.readOnly!.createdTimestamp!.seconds
    ).toBeGreaterThan(firebase.firestore.Timestamp.now().seconds - 5);
  });
});
