import {
  challengesPath,
  getAdminPath,
  getChallengePath,
  IChallenge,
  IChallengeReadOnlyProperties,
  IUser,
} from 'infinitris2-models';
import { setup, teardown, createdTimestamp } from './helpers/setup';
import './helpers/extensions';
import { userId1, userId1Path, existingUser } from './users.test';

const challengeId1 = 'challengeId1';
const challengeId1Path = getChallengePath(challengeId1);
const userIdAdminPath = getAdminPath(userId1);

const validChallenge: Omit<IChallenge, 'readOnly'> = {
  title: 'New challenge',
  finishCriteria: {
    finishChallengeCellFilled: true,
  },
  rewardCriteria: {
    all: {
      maxTimeTaken: 60000,
    },
    bronze: {
      maxBlocksPlaced: 30,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
    gold: {
      maxBlocksPlaced: 10,
    },
  },
  grid: `
0000
0000
XXX0
000X`,
};

const existingUnpublishedChallenge: IChallenge = {
  ...validChallenge,
  readOnly: {
    createdTimestamp,
    userId: userId1,
  },
};

const existingPublishedChallenge: IChallenge = {
  ...existingUnpublishedChallenge,
  isPublished: true,
};

describe('Challenges Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow reading the challenges collection', async () => {
    const db = await setup();

    await expect(db.collection(challengesPath).get()).toAllow();
  });

  test('should allow reading a challenge', async () => {
    const db = await setup();

    await expect(db.doc(getChallengePath(challengeId1)).get()).toAllow();
  });

  test('should deny creating a challenge when logged out', async () => {
    const db = await setup();

    await expect(db.doc(challengeId1Path).set(validChallenge)).toDeny();
  });

  test('should allow creating a challenge when logged in and has enough credits', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    await expect(db.doc(challengeId1Path).set(validChallenge)).toAllow();
  });

  test('should not allow creating a challenge when not having enough credits', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: {
          ...existingUser,
          credits: 0,
        } as IUser,
      }
    );

    await expect(db.doc(challengeId1Path).set(validChallenge)).toDeny();
  });

  test('should deny creating a challenge with isOfficial property when not admin', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    await expect(
      db.doc(challengeId1Path).set({
        ...validChallenge,
        isOfficial: true,
      } as IChallenge)
    ).toDeny();
  });

  test('should allow creating a challenge with isOfficial property when admin', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [userIdAdminPath]: {},
      }
    );

    await expect(
      db.doc(challengeId1Path).set({
        ...validChallenge,
        isOfficial: true,
      })
    ).toAllow();
  });

  test('should allow updating an unpublished challenge', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [challengeId1Path]: existingUnpublishedChallenge,
      }
    );

    await expect(
      db.doc(challengeId1Path).set(
        {
          title: existingUnpublishedChallenge.title + '2',
        },
        { merge: true }
      )
    ).toAllow();
  });

  test('should deny updating a published challenge', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [challengeId1Path]: existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(challengeId1Path).set(
        {
          title: existingPublishedChallenge.title + '2',
        },
        { merge: true }
      )
    ).toDeny();
  });

  test('should not be able to write readonly properties', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );
    await expect(
      db.doc(userId1Path).set(
        {
          readOnly: {
            userId: 'test',
          } as IChallengeReadOnlyProperties,
        },
        { merge: true }
      )
    ).toDeny();
  });

  // TODO: cannot update someone else's unpublished challenge (same ID)

  // TODO: admin can update challenge

  // TODO: properties outside of allow list
  // TODO: invalid property types
  // TODO: test all fields
});
