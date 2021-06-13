import * as functions from 'firebase-functions';
import { IChallenge, IRating } from 'infinitris2-models';
import { getDb } from './utils/firebase';
import firebase from 'firebase';
import IUpdateEntityRating from './models/IUpdateEntityRating';
//import { getDb } from './utils/firebase';
import * as admin from 'firebase-admin';

export const onCreateRating = functions.firestore
  .document('ratings/{ratingId}')
  .onCreate(async (snapshot, context) => {
    const userId = context.auth?.uid;
    if (!userId) {
      throw new Error('User not logged in');
    }
    // FIXME: Update to match new schema
    const rating = snapshot.data() as IRating;
    const challengeDocRef = getDb().doc(`challenges/${rating.entityId}`);
    const challenge = (await challengeDocRef.get()).data() as IChallenge;

    // race condition accounted for as numRatings and summedRating are atomic
    const expectedNewRatingValue =
      (challenge.readOnly.summedRating + rating.value) /
      (challenge.readOnly.numRatings + 1);

    const updatedChallenge: IUpdateEntityRating = {
      'readOnly.numRatings': firebase.firestore.FieldValue.increment(1),
      'readOnly.summedRating': firebase.firestore.FieldValue.increment(
        rating.value
      ),
      'readOnly.rating': expectedNewRatingValue,
    };

    challengeDocRef.update(updatedChallenge);

    return snapshot.ref.set(
      {
        readOnly: {
          createdTimestamp: admin.firestore.Timestamp.now(),
          userId,
        },
      } as Pick<IRating, 'readOnly'>,
      { merge: true }
    );
  });
