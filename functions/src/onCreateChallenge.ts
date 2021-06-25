import * as functions from 'firebase-functions';
import { IChallenge } from 'infinitris2-models';
import { getDb } from './utils/firebase';
import * as admin from 'firebase-admin';
import firebase from 'firebase';
import IUpdateUserReadOnly from './models/IUpdateUserReadOnly';

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
      const updateUserCreditsRequest: IUpdateUserReadOnly = {
        'readOnly.coins': firebase.firestore.FieldValue.increment(-1),
      };
      await userDocRef.update(updateUserCreditsRequest);

      await snapshot.ref.update({
        readOnly: {
          createdTimestamp: admin.firestore.Timestamp.now(),
          userId,
          numRatings: 0,
          rating: 0,
          summedRating: 0,
        },
      } as Pick<IChallenge, 'readOnly'>);
    } catch (error) {
      console.error(error);
    }
  });
