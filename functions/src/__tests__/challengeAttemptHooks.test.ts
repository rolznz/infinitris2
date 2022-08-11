import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import {
  challengeAttemptsPath,
  IChallenge,
  IChallengeAttempt,
  IChallengeAttemptReadOnlyProperties,
  verifyProperty,
} from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import { onCreateChallengeAttempt } from '../onCreateChallengeAttempt';
import { firestore } from '@firebase/rules-unit-testing';

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
      )
    );

    const challenge = (
      await db.doc(dummyData.challenge1Path).get()
    ).data() as IChallenge;
    expect(challenge.readOnly!.numAttempts).toBe(1);
    expect(challenge.readOnly!.topAttempts?.[0]?.id).toBe(
      dummyData.challengeAttemptId1
    );

    const challengeAttempt = (
      await db.doc(dummyData.challengeAttempt1Path).get()
    ).data() as IChallengeAttempt;
    expect(challengeAttempt.created).toBe(true);
    expect(challengeAttempt.readOnly?.isPlayerTopAttempt).toBe(true);
    expect(challengeAttempt.userId).toBe(dummyData.userId1);
    expect(
      challengeAttempt.readOnly!.createdTimestamp!.seconds
    ).toBeGreaterThan(firestore.Timestamp.now().seconds - 5);
  });

  test('update player top attempt if time is faster', async () => {
    const existingChallengeAttempt: IChallengeAttempt = {
      ...dummyData.creatableChallengeAttempt,
      readOnly: {
        isPlayerTopAttempt: true,
      } as IChallengeAttemptReadOnlyProperties,
      stats: {
        ...dummyData.creatableChallengeAttempt.stats,
        timeTakenMs: dummyData.creatableChallengeAttempt.stats.timeTakenMs + 1,
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.challengeAttempt1Path]: dummyData.creatableChallengeAttempt,
        [dummyData.challengeAttempt2Path]: existingChallengeAttempt,
      },
      false
    );

    await test.wrap(onCreateChallengeAttempt)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableChallengeAttempt,
        dummyData.challengeAttempt1Path
      )
    );

    const challengeAttempt = (
      await db.doc(dummyData.challengeAttempt1Path).get()
    ).data() as IChallengeAttempt;
    expect(challengeAttempt.readOnly?.isPlayerTopAttempt).toBe(true);

    // only have one top attempt per player (on the same challenge)
    const topAttempts = await db
      .collection(challengeAttemptsPath)
      .where(
        verifyProperty<IChallengeAttempt>('readOnly.isPlayerTopAttempt'),
        '==',
        true
      )
      .get();
    expect(topAttempts.docs.length).toBe(1);
  });

  test('do not update player top attempt if time is slower', async () => {
    const existingChallengeAttempt: IChallengeAttempt = {
      ...dummyData.creatableChallengeAttempt,
      readOnly: {
        isPlayerTopAttempt: true,
      } as IChallengeAttemptReadOnlyProperties,
      stats: {
        ...dummyData.creatableChallengeAttempt.stats,
        timeTakenMs: dummyData.creatableChallengeAttempt.stats.timeTakenMs - 1,
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.challengeAttempt1Path]: dummyData.creatableChallengeAttempt,
        [dummyData.challengeAttempt2Path]: existingChallengeAttempt,
      },
      false
    );

    await test.wrap(onCreateChallengeAttempt)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableChallengeAttempt,
        dummyData.challengeAttempt1Path
      )
    );

    const challengeAttempt = (
      await db.doc(dummyData.challengeAttempt1Path).get()
    ).data() as IChallengeAttempt;
    expect(challengeAttempt.readOnly?.isPlayerTopAttempt).toBeFalsy();
  });

  test('update challenge top attempts', async () => {
    function customizeAttempt(
      userId: string,
      timeTakenMs: number
    ): IChallengeAttempt {
      return {
        ...dummyData.creatableChallengeAttempt,
        userId,
        stats: {
          ...dummyData.creatableChallengeAttempt.stats,
          timeTakenMs,
        },
        readOnly: {
          isPlayerTopAttempt: true,
        } as IChallengeAttemptReadOnlyProperties,
      };
    }

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.challengeAttempt1Path]: customizeAttempt('user-1', 1),
        [dummyData.challengeAttempt2Path]: customizeAttempt('user-2', 2),
        [dummyData.challengeAttempt3Path]: customizeAttempt('user-3', 4),
        [dummyData.challengeAttempt4Path]: customizeAttempt('user-4', 3),
      },
      false
    );

    await test.wrap(onCreateChallengeAttempt)(
      test.firestore.makeDocumentSnapshot(
        dummyData.creatableChallengeAttempt,
        dummyData.challengeAttempt1Path
      )
    );

    const challenge = (
      await db.doc(dummyData.challenge1Path).get()
    ).data() as IChallenge;
    expect(challenge.readOnly!.topAttempts?.length).toBe(3);
    expect(challenge.readOnly!.topAttempts?.[0]?.id).toBe(
      dummyData.challengeAttemptId1
    );
    expect(challenge.readOnly!.topAttempts?.[0]?.stats.timeTakenMs).toBe(1);
    expect(challenge.readOnly!.topAttempts?.[1]?.id).toBe(
      dummyData.challengeAttemptId2
    );
    expect(challenge.readOnly!.topAttempts?.[1]?.stats.timeTakenMs).toBe(2);
    expect(challenge.readOnly!.topAttempts?.[2]?.id).toBe(
      dummyData.challengeAttemptId4
    );
    expect(challenge.readOnly!.topAttempts?.[2]?.stats.timeTakenMs).toBe(3);
  });
});
