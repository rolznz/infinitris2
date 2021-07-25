import {
  ratingsPath,
  getRatingPath,
  IRating,
  IChallenge,
} from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

describe('Rating Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should allow reading the ratings collection', async () => {
    const { db } = await setup();

    await expect(db.collection(ratingsPath).get()).toAllow();
  });

  test('should allow reading a rating', async () => {
    const { db } = await setup();

    await expect(db.doc(dummyData.rating1Path).get()).toAllow();
  });

  test('should deny creating a rating when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
    });

    await expect(
      db.doc(dummyData.rating1Path).set(dummyData.creatableRating)
    ).toDeny();
  });

  test('should deny rating self-made entities', async () => {
    const ownChallenge: IChallenge = {
      ...dummyData.existingPublishedChallenge,
      readOnly: {
        ...dummyData.existingPublishedChallenge.readOnly,
        userId: dummyData.userId2,
      },
    };

    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.challenge1Path]: ownChallenge,
      }
    );

    await expect(
      db.doc(dummyData.rating1Path).set(dummyData.creatableRating)
    ).toDeny();
  });

  test('should allow creating a rating when logged in', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.rating1Path).set(dummyData.creatableRating)
    ).toAllow();
  });

  test('should not allow creating a rating with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.rating1Path).set({
        ...dummyData.creatableRating,
        created: true,
      } as IRating)
    ).toDeny();
  });

  test('should not allow creating a rating for a non-existent entity', async () => {
    const { db } = await setup({ uid: dummyData.userId2 });

    await expect(
      db.doc(dummyData.rating1Path).set(dummyData.creatableRating)
    ).toDeny();
  });

  test('should not allow creating a rating for an unsupported entity type', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    const ratingRequest: Pick<
      IRating,
      'entityCollectionPath' | 'entityId' | 'value'
    > = {
      entityCollectionPath: 'users' as any,
      entityId: dummyData.userId1,
      value: 3,
    };

    await expect(
      db
        .doc(
          getRatingPath(
            ratingRequest.entityCollectionPath,
            ratingRequest.entityId,
            dummyData.userId2
          )
        )
        .set(ratingRequest)
    ).toDeny();
  });

  test('should not allow creating a rating for an unpublished challenge', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.challenge1Path]: dummyData.existingUnpublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.rating1Path).set(dummyData.creatableRating)
    ).toDeny();
  });

  test('should not allow creating a rating with invalid value', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.rating1Path).set({
        ...dummyData.creatableRating,
        value: 0,
      })
    ).toDeny();

    await expect(
      db.doc(dummyData.rating1Path).set({
        ...dummyData.creatableRating,
        value: 6,
      })
    ).toDeny();
  });

  test('should not allow creating a rating with invalid property', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      }
    );

    await expect(
      db.doc(dummyData.rating1Path).set({
        ...dummyData.creatableRating,
        nonExistentValue: 0,
      })
    ).toDeny();
  });
});
