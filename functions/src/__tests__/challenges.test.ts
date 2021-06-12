import {
  challengesPath,
  getAdminPath,
  getChallengePath,
  IChallenge,
  IUser,
} from 'infinitris2-models';
import { setup, teardown, createdTimestamp } from './helpers/setup';
import './helpers/extensions';
import { userId1, userId1Path, existingUser, userId2 } from './users.test';

const challengeId1 = 'challengeId1';
const challengeId1Path = getChallengePath(challengeId1);
const userIdAdminPath = getAdminPath(userId1);

const validChallenge: Omit<IChallenge, 'readOnly'> = {
  title: 'New challenge',
  simulationSettings: {
    allowedBlockLayoutIds: ['1', '2'],
  },
  finishCriteria: {},
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
    const userWithNoCredits: IUser = {
      ...existingUser,
      readOnly: {
        ...existingUser.readOnly,
        credits: 0,
      },
    };

    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: userWithNoCredits,
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

    const officialChallenge: IChallenge = {
      ...validChallenge,
      isOfficial: true,
    };

    await expect(db.doc(challengeId1Path).set(officialChallenge)).toDeny();
  });

  test('should allow creating a challenge with isOfficial property when admin', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [userIdAdminPath]: {},
      }
    );

    const officialChallenge: IChallenge = {
      ...validChallenge,
      isOfficial: true,
    };

    await expect(db.doc(challengeId1Path).set(officialChallenge)).toAllow();
  });

  test('should allow updating an unpublished challenge', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [challengeId1Path]: existingUnpublishedChallenge,
      }
    );

    const challengeToUpdate: Pick<IChallenge, 'title'> = {
      title: existingUnpublishedChallenge.title + '2',
    };
    await expect(
      db.doc(challengeId1Path).set(challengeToUpdate, { merge: true })
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

    const challengeToUpdate: Pick<IChallenge, 'title'> = {
      title: existingUnpublishedChallenge.title + '2',
    };

    await expect(
      db.doc(challengeId1Path).set(challengeToUpdate, { merge: true })
    ).toDeny();
  });

  test('should allow admin updating a published challenge', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [userIdAdminPath]: {},
        [challengeId1Path]: existingPublishedChallenge,
      }
    );

    const challengeToUpdate: Pick<IChallenge, 'title'> = {
      title: existingUnpublishedChallenge.title + '2',
    };

    await expect(
      db.doc(challengeId1Path).set(challengeToUpdate, { merge: true })
    ).toAllow();
  });

  test("should not allow updating someone else's unpublished challenge", async () => {
    const db = await setup(
      { uid: userId2 },
      {
        [userId1Path]: existingUser,
        [challengeId1Path]: existingUnpublishedChallenge,
      }
    );

    const challengeToUpdate: Pick<IChallenge, 'title'> = {
      title: existingUnpublishedChallenge.title + '2',
    };

    await expect(
      db.doc(challengeId1Path).set(challengeToUpdate, { merge: true })
    ).toDeny();
  });

  test('should not be create challenge with readonly properties', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    const challengeToCreate: IChallenge = {
      ...validChallenge,
      readOnly: {
        userId: 'test',
      },
    };

    await expect(db.doc(userId1Path).set(challengeToCreate)).toDeny();
  });

  test('should not be update challenge with readonly properties', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [challengeId1Path]: existingUnpublishedChallenge,
      }
    );

    const challengeToUpdate: Pick<IChallenge, 'readOnly'> = {
      readOnly: {
        userId: 'test',
      },
    };

    await expect(
      db.doc(userId1Path).set(challengeToUpdate, { merge: true })
    ).toDeny();
  });

  test('should deny creating a challenge with non-allowed property', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    await expect(
      db
        .doc(challengeId1Path)
        .set({ ...validChallenge, someNonExistentProperty: 'a' })
    ).toDeny();
  });

  test('should not allow setting incorrect property types on challenge', async () => {
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
          title: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          description: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          finishCriteria: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          firstBlockLayoutId: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          grid: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          isMandatory: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          isOfficial: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          isPublished: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          locale: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          priority: 'invalid-value',
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          simulationSettings: 1,
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          simulationSettings: {
            gravityEnabled: 1,
          },
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          simulationSettings: {
            allowedBlockLayoutIds: 1,
          },
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          simulationSettings: {
            allowedBlockLayoutIds: [1],
          },
        },
        { merge: true }
      )
    ).toDeny();

    await expect(
      db.doc(challengeId1Path).set(
        {
          rewardCriteria: 1,
        },
        { merge: true }
      )
    ).toDeny();

    // simulation settings: unsupported value
    await expect(
      db.doc(challengeId1Path).set(
        {
          simulationSettings: {
            nonExistentSetting: false,
          },
        },
        { merge: true }
      )
    ).toDeny();

    // reward criteria: unsupported medal
    await expect(
      db.doc(challengeId1Path).set(
        {
          rewardCriteria: {
            nonExistentSetting: false,
          },
        },
        { merge: true }
      )
    ).toDeny();

    for (const medal of ['bronze', 'silver', 'gold', 'all']) {
      // reward criteria medal: unsupported value
      await expect(
        db.doc(challengeId1Path).set(
          {
            rewardCriteria: {
              [medal]: {
                nonExistentSetting: false,
              },
            },
          },
          { merge: true }
        )
      ).toDeny();

      // reward criteria medal: incorrect property type
      await expect(
        db.doc(challengeId1Path).set(
          {
            rewardCriteria: {
              [medal]: {
                minLinesCleared: false,
              },
            },
          },
          { merge: true }
        )
      ).toDeny();

      await expect(
        db.doc(challengeId1Path).set(
          {
            rewardCriteria: {
              [medal]: {
                maxLinesCleared: false,
              },
            },
          },
          { merge: true }
        )
      ).toDeny();

      await expect(
        db.doc(challengeId1Path).set(
          {
            rewardCriteria: {
              [medal]: {
                minBlocksPlaced: false,
              },
            },
          },
          { merge: true }
        )
      ).toDeny();

      await expect(
        db.doc(challengeId1Path).set(
          {
            rewardCriteria: {
              [medal]: {
                maxBlocksPlaced: false,
              },
            },
          },
          { merge: true }
        )
      ).toDeny();

      await expect(
        db.doc(challengeId1Path).set(
          {
            rewardCriteria: {
              [medal]: {
                maxTimeTaken: false,
              },
            },
          },
          { merge: true }
        )
      ).toDeny();
    }

    // finish criteria: unsupported value
    await expect(
      db.doc(challengeId1Path).set(
        {
          finishCriteria: {
            nonExistentSetting: false,
          },
        },
        { merge: true }
      )
    ).toDeny();

    // finish criteria invalid property types
    await expect(
      db.doc(challengeId1Path).set(
        {
          finishCriteria: {
            maxBlocksPlaced: 'test',
          },
        },
        { merge: true }
      )
    ).toDeny();
    await expect(
      db.doc(challengeId1Path).set(
        {
          finishCriteria: {
            maxLinesCleared: 'test',
          },
        },
        { merge: true }
      )
    ).toDeny();
    await expect(
      db.doc(challengeId1Path).set(
        {
          finishCriteria: {
            maxTimeTaken: 'test',
          },
        },
        { merge: true }
      )
    ).toDeny();
    await expect(
      db.doc(challengeId1Path).set(
        {
          finishCriteria: {
            gridEmpty: 'test',
          },
        },
        { merge: true }
      )
    ).toDeny();
  });

  test('challenge property values must fit criteria', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
        [challengeId1Path]: existingUnpublishedChallenge,
      }
    );
    // challenge title too long
    await expect(
      db.doc(challengeId1Path).set(
        {
          title: 'a'.repeat(21),
        },
        { merge: true }
      )
    ).toDeny();

    // challenge title invalid character
    await expect(
      db.doc(challengeId1Path).set(
        {
          title: '#',
        },
        { merge: true }
      )
    ).toDeny();

    // description too long
    await expect(
      db.doc(challengeId1Path).set(
        {
          description: 'a'.repeat(281),
        },
        { merge: true }
      )
    ).toDeny();

    // grid must not be empty
    await expect(
      db.doc(challengeId1Path).set(
        {
          grid: '',
        },
        { merge: true }
      )
    ).toDeny();

    // allowed layout IDs length must be less than 3 if included
    await expect(
      db.doc(challengeId1Path).set(
        {
          simulationSettings: {
            allowedBlockLayoutIds: ['1', '2', '3', '4'],
          },
        },
        { merge: true }
      )
    ).toDeny();
  });
});
