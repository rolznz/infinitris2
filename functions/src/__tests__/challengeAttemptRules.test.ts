import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { IChallengeAttempt } from '../../../models/dist';
import ChallengeCompletionStats from '../../../models/dist/src/ChallengeCompletionStats';

describe('Challenge Attempt Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow creating a challenge attempt for a published challenge', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db
        .doc(dummyData.challengeAttempt1Path)
        .set(dummyData.creatableChallengeAttempt)
    ).toAllow();
  });

  test('should deny creating a challenge attempt for an unpublished challenge', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingUnpublishedChallenge,
      }
    );

    await expect(
      db
        .doc(dummyData.challengeAttempt1Path)
        .set(dummyData.creatableChallengeAttempt)
    ).toDeny();
  });

  test('should deny creating a challenge attempt for a non-existent challenge', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db
        .doc(dummyData.challengeAttempt1Path)
        .set(dummyData.creatableChallengeAttempt)
    ).toDeny();
  });

  test('should deny creating a challenge attempt when logged out', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db
        .doc(dummyData.challengeAttempt1Path)
        .set(dummyData.creatableChallengeAttempt)
    ).toDeny();
  });

  test('should deny creating a challenge attempt with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    const challengeAttempt: IChallengeAttempt = {
      ...dummyData.creatableChallengeAttempt,
      created: true,
    };

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set(challengeAttempt)
    ).toDeny();
  });

  test('should deny creating a challenge attempt with invalid property', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        nonExistentProperty: true,
      })
    ).toDeny();
  });

  test('should deny creating a challenge attempt with invalid property value', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        status: 'pending', // status must be success or failed
      } as IChallengeAttempt)
    ).toDeny();

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        medalIndex: 0, // medalIndex must be 1-3
      } as IChallengeAttempt)
    ).toDeny();

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        stats: ({
          nonExistentProperty: 5,
        } as any) as ChallengeCompletionStats,
      } as IChallengeAttempt)
    ).toDeny();

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        stats: {
          blocksPlaced: ('5' as any) as number,
        },
      } as IChallengeAttempt)
    ).toDeny();

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        stats: {
          linesCleared: ('5' as any) as number,
        },
      } as IChallengeAttempt)
    ).toDeny();

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        stats: {
          linesCleared: ('5' as any) as number,
        },
      } as IChallengeAttempt)
    ).toDeny();

    await expect(
      db.doc(dummyData.challengeAttempt1Path).set({
        ...dummyData.creatableChallengeAttempt,
        stats: {
          timeTakenMs: ('5' as any) as number,
        },
      } as IChallengeAttempt)
    ).toDeny();
  });

  test('should deny updating a challenge attempt', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
        [dummyData.challengeAttempt1Path]: dummyData.creatableChallengeAttempt,
      }
    );

    await expect(
      db
        .doc(dummyData.challengeAttempt1Path)
        .set(dummyData.creatableChallengeAttempt)
    ).toDeny();
  });
});
