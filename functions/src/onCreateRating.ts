import * as functions from 'firebase-functions';
import { IChallenge, IRating, objectToDotNotation } from 'infinitris2-models';
import { getDb } from './utils/firebase';
import firebase from 'firebase';
import * as admin from 'firebase-admin';
import updateNetworkImpact from './utils/updateNetworkImpact';

export const onCreateRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }
      // FIXME: Update to match new schema
      const rating = snapshot.data() as IRating;
      const challengeDocRef = getDb().doc(`challenges/${rating.entityId}`);
      const challenge = (await challengeDocRef.get()).data() as IChallenge;

      // race condition in rating property accounted for as numRatings and summedRating are atomic
      const expectedNewRatingValue =
        (challenge.readOnly.summedRating + rating.value) /
        (challenge.readOnly.numRatings + 1);

      const updateChallenge = objectToDotNotation<IChallenge>(
        {
          readOnly: {
            numRatings: (firebase.firestore.FieldValue.increment(
              1
            ) as any) as number,
            summedRating: (firebase.firestore.FieldValue.increment(
              rating.value
            ) as any) as number,
            rating: expectedNewRatingValue,
          },
        },
        ['readOnly.numRatings', 'readOnly.summedRating', 'readOnly.rating']
      );

      challengeDocRef.update(updateChallenge);

      if (rating.value > 2) {
        // only reward positive ratings
        updateNetworkImpact(challenge.readOnly.userId!, userId);
      }

      await snapshot.ref.update({
        readOnly: {
          createdTimestamp: admin.firestore.Timestamp.now(),
          lastModifiedTimestamp: admin.firestore.Timestamp.now(),
          numTimesModified: 0,
          userId,
        },
        created: true,
      } as Pick<IRating, 'readOnly' | 'created'>);
    } catch (error) {
      console.error(error);
    }
  });
