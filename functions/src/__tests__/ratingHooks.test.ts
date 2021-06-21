import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IChallenge, IRating } from 'infinitris2-models';
import firebase from 'firebase';
import { onCreateRating } from '../onCreateRating';
import dummyData from './helpers/dummyData';

describe('Rating Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create rating', async () => {
    const { db, test } = await setup(
      undefined,
      {
        [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      },
      false
    );

    await db.doc(dummyData.rating1Path).set(dummyData.validRatingRequest);

    await test.wrap(onCreateRating)(
      test.firestore.makeDocumentSnapshot(
        dummyData.validRatingRequest,
        dummyData.rating1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
      }
    );

    const rating = (
      await db.doc(dummyData.rating1Path).get()
    ).data() as IRating;

    expect(rating.readOnly.userId).toBe(dummyData.userId1);
    expect(rating.readOnly.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    const challenge = (
      await db.doc(dummyData.challenge1Path).get()
    ).data() as IChallenge;
    expect(challenge.readOnly.numRatings).toBe(1);
    expect(challenge.readOnly.summedRating).toBe(rating.value);
    expect(challenge.readOnly.rating).toBe(rating.value);
  });
});
