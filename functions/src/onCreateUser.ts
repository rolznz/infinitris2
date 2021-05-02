import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './utils/constants';
import { IAffiliate, IUser } from 'infinitris2-models';
import updateNetworkImpact from './utils/updateNetworkImpact';

export const onCreateUser = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, _context) => {
    let credits = 3;
    // give the user 3 credits
    // TODO: affiliate system reward
    const user = snapshot.data() as IUser;
    if (user.referredByAffiliateId) {
      const affiliateDocRef = db.doc(
        `affiliates/${user.referredByAffiliateId}`
      );
      const affiliateDoc = await affiliateDocRef.get();
      if (affiliateDoc.exists) {
        const affiliate = affiliateDoc.data() as IAffiliate;
        credits += (affiliate.referralCount || 0) + 3;
        await updateNetworkImpact(affiliate.userId, snapshot.id);
        const conversionRef = db.doc(
          `affiliates/${user.referredByAffiliateId}/conversions/${snapshot.id}`
        );
        await conversionRef.set({
          createdTimestamp: admin.firestore.Timestamp.now(),
        });

        await affiliateDocRef.update({
          referralCount: (admin.firestore.FieldValue.increment(
            1
          ) as any) as number,
        } as Pick<IAffiliate, 'referralCount'>);
      }
    }

    return snapshot.ref.update({
      credits,
      createdTimestamp: admin.firestore.Timestamp.now(),
    } as Pick<IUser, 'credits' | 'createdTimestamp'>);
  });
