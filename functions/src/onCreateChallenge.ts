import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { IChallenge, IUser } from 'infinitris2-models';
import updateNetworkImpact from './utils/updateNetworkImpact';
import { db } from './utils/constants';

export const onCreateChallenge = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snapshot, _context) => {
    const challenge = snapshot.data();
    // reduce the number of credits the user has so they
    // cannot create an infinite number of challenges
    const userDocRef = db.doc(`users/${challenge.userId}`);
    await userDocRef.update({
      credits: (admin.firestore.FieldValue.increment(-1) as any) as number,
    } as Pick<IUser, 'credits'>);

    if (challenge.clonedFromUserId) {
      await updateNetworkImpact(challenge.clonedFromUserId, challenge.userId);
    }

    return snapshot.ref.update({
      createdTimestamp: admin.firestore.Timestamp.now(),
    } as Pick<IChallenge, 'createdTimestamp'>);
  });