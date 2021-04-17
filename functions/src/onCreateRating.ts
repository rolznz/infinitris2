import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './utils/constants';
import { IChallenge, IRating } from 'infinitris2-models';
import updateNetworkImpact from './utils/updateNetworkImpact';

export const onCreateRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snapshot, _context) => {
    const rating = snapshot.data() as IRating;
    if (rating.entityCollection === 'challenges') {
      const challengeDocRef = db.doc(`challenges/${snapshot.data().entityId}`);
      try {
        // update the challenge total rating
        // TODO: maybe could use increment on the two values rather than requiring a transaction
        await db.runTransaction(async (t) => {
          const challengeDoc = await t.get(challengeDocRef);
          const challenge = challengeDoc.data() as IChallenge;
          if (challenge) {
            const oldNumRatings = challenge.numRatings || 0;
            const oldTotalRating = challenge.totalRating || 0;
            const numRatings = oldNumRatings + 1;
            const totalRating =
              oldTotalRating * (oldNumRatings / numRatings) +
              rating.value * (1 / numRatings);
            t.update(challengeDocRef, { numRatings, totalRating });
          }
        });

        console.log('Updated challenge rating: ', rating.entityId);

        await (async () => {
          const challengeDoc = await challengeDocRef.get();
          const challenge = challengeDoc.data() as IChallenge;
          if (challenge) {
            await updateNetworkImpact(challenge.userId, rating.userId);
          }
        })();
      } catch (e) {
        console.log('Failed to update challenge rating: ', e);
      }
    } else {
      throw new Error(
        'Unsupported entity collection: ' + rating.entityCollection
      );
    }
    return snapshot.ref.update({
      createdTimestamp: admin.firestore.Timestamp.now(),
    } as Pick<IRating, 'createdTimestamp'>);
  });
