import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './utils/constants';
import { IAffiliate, IUser } from 'infinitris2-models';

export const onCreateAffiliate = functions.firestore
  .document('affiliates/{affiliateId}')
  .onCreate(async (snapshot, context) => {
    // FIXME: update to match new schema
    /*const userId = context.auth?.uid;
    if (!userId) {
      throw new Error('User not logged in');
    }
    //const affiliate = snapshot.data() as IAffiliate;

    const userDocRef = db.doc(`users/${userId}`);
    await userDocRef.update({
      affiliateId: snapshot.id,
    } as Pick<IUser, 'credits' | 'affiliateId'>);

    return snapshot.ref.update({
      referralCount: 0,
      createdTimestamp: admin.firestore.Timestamp.now(),
      userId,
    } as Pick<IAffiliate, 'createdTimestamp' | 'referralCount'>);*/
  });
