import * as functions from 'firebase-functions';
import {
  getChallengePath,
  IChallenge,
  IRating,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb, increment } from './utils/firebase';
import updateNetworkImpact from './utils/updateNetworkImpact';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';

export const onCreateRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snapshot, context) => {
    try {
      const rating = snapshot.data() as IRating;
      const userId = rating.userId;
      if (!userId) {
        throw new Error('User not logged in');
      }
      const challengeDocRef = getDb().doc(getChallengePath(rating.entityId));
      const challenge = (await challengeDocRef.get()).data() as IChallenge;

      // race condition in rating property accounted for as numRatings and summedRating are atomic
      const expectedNewRatingValue =
        (challenge.readOnly!.summedRating + rating.value) /
        (challenge.readOnly!.numRatings + 1);

      const updateChallenge = objectToDotNotation<IChallenge>(
        {
          readOnly: {
            numRatings: increment(1),
            summedRating: increment(rating.value),
            rating: expectedNewRatingValue,
          },
        },
        ['readOnly.numRatings', 'readOnly.summedRating', 'readOnly.rating']
      );

      challengeDocRef.update(updateChallenge);

      if (rating.value > 2) {
        // only reward positive ratings
        updateNetworkImpact(challenge.userId, userId);
      }

      // apply update using current database instance
      await getDb()
        .doc(snapshot.ref.path)
        .update({
          readOnly: {
            ...getDefaultEntityReadOnlyProperties(),
            userId,
          },
          created: true,
        } as Pick<IRating, 'readOnly' | 'created'>);
    } catch (error) {
      console.error(error);
    }
  });
