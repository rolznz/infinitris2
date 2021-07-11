import * as functions from 'firebase-functions';
import {
  affiliatesPath,
  getUserPath,
  IAffiliate,
  IUser,
} from 'infinitris2-models';
import { getDb } from './utils/firebase';
import firebase from 'firebase';

export const onCreateAuthUser = functions.auth.user().onCreate(async (user) => {
  try {
    if (!user.email) {
      throw new Error(`No email provided for user ${user.uid}`);
    }
    const userRef = getDb().doc(getUserPath(user.uid));

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const affiliateRef = getDb().collection(affiliatesPath).doc();
      const affiliateToCreate: IAffiliate = {
        readOnly: {
          numConversions: 0,
          createdTimestamp: firebase.firestore.Timestamp.now(),
          lastModifiedTimestamp: firebase.firestore.Timestamp.now(),
          numTimesModified: 0,
          userId: user.uid,
        },
        created: true,
      };

      await affiliateRef.set(affiliateToCreate);

      const newUser: IUser = {
        readOnly: {
          createdTimestamp: firebase.firestore.Timestamp.now(),
          lastModifiedTimestamp: firebase.firestore.Timestamp.now(),
          numTimesModified: 0,
          email: user.email!,
          coins: 3,
          networkImpact: 0,
          affiliateId: affiliateRef.id,
        },
        created: true,
      };
      await userRef.set(newUser);
    } else {
      throw new Error(`Could not create user ${user.uid} - already exists`);
    }
  } catch (error) {
    console.error(error);
  }
});
