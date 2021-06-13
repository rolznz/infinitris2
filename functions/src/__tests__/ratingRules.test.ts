import {
  ratingsPath,
  getRatingPath,
  IRating,
  IChallenge,
} from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { existingUser, userId1, userId1Path, userId2 } from './userRules.test';
import {
  challengeId1,
  challenge1Path,
  existingPublishedChallenge,
  existingUnpublishedChallenge,
} from './challengeRules.test';

export const validRatingRequest: Pick<
  IRating,
  'entityCollection' | 'entityId' | 'value'
> = {
  entityCollection: 'challenges',
  entityId: challengeId1,
  value: 3,
};

export const ratingId1Path = getRatingPath(
  validRatingRequest.entityCollection,
  validRatingRequest.entityId,
  userId2
);

describe('Ratings Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow reading the ratings collection', async () => {
    const { db } = await setup();

    await expect(db.collection(ratingsPath).get()).toAllow();
  });

  test('should allow reading a rating', async () => {
    const { db } = await setup();

    await expect(db.doc(ratingId1Path).get()).toAllow();
  });

  test('should deny creating a rating when logged out', async () => {
    const { db } = await setup(undefined, {
      [challenge1Path]: existingPublishedChallenge,
    });

    await expect(db.doc(ratingId1Path).set(validRatingRequest)).toDeny();
  });

  test('should deny rating self-made entities', async () => {
    const ownChallenge: IChallenge = {
      ...existingPublishedChallenge,
      readOnly: {
        ...existingPublishedChallenge.readOnly,
        userId: userId2,
      },
    };

    const { db } = await setup(
      { uid: userId2 },
      {
        [challenge1Path]: ownChallenge,
      }
    );

    await expect(db.doc(ratingId1Path).set(validRatingRequest)).toDeny();
  });

  test('should allow creating a rating when logged in', async () => {
    const { db } = await setup(
      { uid: userId2 },
      {
        [challenge1Path]: existingPublishedChallenge,
      }
    );

    await expect(db.doc(ratingId1Path).set(validRatingRequest)).toAllow();
  });

  test('should not allow creating a rating for a non-existent entity', async () => {
    const { db } = await setup({ uid: userId2 });

    await expect(db.doc(ratingId1Path).set(validRatingRequest)).toDeny();
  });

  test('should not allow creating a rating for an unsupported entity type', async () => {
    const { db } = await setup(
      { uid: userId2 },
      {
        [userId1Path]: existingUser,
      }
    );

    const ratingRequest: Pick<
      IRating,
      'entityCollection' | 'entityId' | 'value'
    > = {
      entityCollection: 'users' as any,
      entityId: userId1,
      value: 3,
    };

    await expect(
      db
        .doc(
          getRatingPath(
            ratingRequest.entityCollection,
            ratingRequest.entityId,
            userId2
          )
        )
        .set(ratingRequest)
    ).toDeny();
  });

  test('should not allow creating a rating for an unpublished challenge', async () => {
    const { db } = await setup(
      { uid: userId2 },
      {
        [challenge1Path]: existingUnpublishedChallenge,
      }
    );

    await expect(db.doc(ratingId1Path).set(validRatingRequest)).toDeny();
  });

  test('should not allow creating a rating with invalid value', async () => {
    const { db } = await setup(
      { uid: userId2 },
      {
        [challenge1Path]: existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(ratingId1Path).set({
        ...validRatingRequest,
        value: 0,
      })
    ).toDeny();

    await expect(
      db.doc(ratingId1Path).set({
        ...validRatingRequest,
        value: 6,
      })
    ).toDeny();
  });

  test('should not allow creating a rating with invalid property', async () => {
    const { db } = await setup(
      { uid: userId2 },
      {
        [challenge1Path]: existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(ratingId1Path).set({
        ...validRatingRequest,
        nonExistentValue: 0,
      })
    ).toDeny();
  });
});
