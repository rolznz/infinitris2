import * as functions from 'firebase-functions';
import { IChallenge, IUser, objectToDotNotation } from 'infinitris2-models';
import { getDb } from './utils/firebase';
import * as admin from 'firebase-admin';
import firebase from 'firebase';

export const onCreateChallenge = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }

      // reduce the number of coins the user has so they
      // cannot create an infinite number of challenges
      const userDocRef = getDb().doc(`users/${userId}`);

      const updateUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            coins: (firebase.firestore.FieldValue.increment(
              -1
            ) as any) as number,
          },
        },
        ['readOnly.coins']
      );

      await userDocRef.update(updateUser);

      await snapshot.ref.update({
        readOnly: {
          createdTimestamp: admin.firestore.Timestamp.now(),
          lastModifiedTimestamp: admin.firestore.Timestamp.now(),
          numTimesModified: 0,
          userId,
          numRatings: 0,
          rating: 0,
          summedRating: 0,
        },
        created: true,
      } as Pick<IChallenge, 'readOnly' | 'created'>);
    } catch (error) {
      console.error(error);
    }
  });
