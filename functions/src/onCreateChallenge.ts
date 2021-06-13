import * as functions from 'firebase-functions';

import { IChallenge, IUser } from 'infinitris2-models';

export const onCreateChallenge = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snapshot, context) => {
    const userId = context.auth?.uid;
    if (!userId) {
      throw new Error('User not logged in');
    }

    // FIXME: update to match new schema
    // FIXME: set readonly fields
    /*
    //const challenge = snapshot.data() as IChallenge;
    // reduce the number of credits the user has so they
    // cannot create an infinite number of challenges
    const userDocRef = db.doc(`users/${userId}`);
    await userDocRef.update({
      credits: (admin.firestore.FieldValue.increment(-1) as any) as number,
    } as Pick<IUser, 'credits'>);


    return snapshot.ref.update({
      createdTimestamp: admin.firestore.Timestamp.now(),
      userId,
    } as Pick<IChallenge, 'createdTimestamp' | 'userId'>);*/
  });
