import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './utils/constants';
import { getUserPath, IUser } from 'infinitris2-models';

export const onCreateAuthUser = functions.auth.user().onCreate(async (user) => {
  if (!user.email) {
    throw new Error(`No email provided for user ${user.uid}`);
  }

  // TODO: create the user
  const userRef = db.doc(getUserPath(user.uid));

  await db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    if (!userDoc.exists) {
      const newUser: IUser = {
        readOnly: {
          email: user.email!,
          credits: 3,
          networkImpact: 0,
          createdTimestamp: admin.firestore.Timestamp.now(),
        },
      };
      await userRef.set(newUser);
    } else {
      console.error(`Could not create user ${user.uid} - already exists`);
    }
  });
});
