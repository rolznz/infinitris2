import * as functions from 'firebase-functions';
//import * as admin from 'firebase-admin';
import { getUserPath, IUser } from 'infinitris2-models';
import { getDb } from './utils/firebase';
import firebase from 'firebase';

export const onCreateAuthUser = functions.auth.user().onCreate(async (user) => {
  if (!user.email) {
    throw new Error(`No email provided for user ${user.uid}`);
  }
  const userRef = getDb().doc(getUserPath(user.uid));

  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    const newUser: IUser = {
      readOnly: {
        email: user.email!,
        credits: 3,
        networkImpact: 0,
        createdTimestamp: firebase.firestore.Timestamp.now(),
      },
    };
    await userRef.set(newUser);
  } else {
    throw new Error(`Could not create user ${user.uid} - already exists`);
  }
});
