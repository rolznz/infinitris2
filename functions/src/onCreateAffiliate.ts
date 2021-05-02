import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './utils/constants';
import { IAffiliate, IUser } from 'infinitris2-models';

export const onCreateAffiliate = functions.firestore
  .document('affiliates/{affiliateId}')
  .onCreate(async (snapshot, _context) => {
    const affiliate = snapshot.data() as IAffiliate;

    const userDocRef = db.doc(`users/${affiliate.userId}`);
    await userDocRef.update({
      affiliateId: snapshot.id,
    } as Pick<IUser, 'credits' | 'affiliateId'>);

    return snapshot.ref.update({
      referrals: 0,
      createdTimestamp: admin.firestore.Timestamp.now(),
    } as Pick<IAffiliate, 'createdTimestamp'>);
  });
