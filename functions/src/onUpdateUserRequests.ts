/*import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './utils/constants';
import { IAffiliate, IUser } from 'infinitris2-models';
import updateNetworkImpact from './utils/updateNetworkImpact';*/

// TODO: handle each field separately (nickname, color etc.)
/*export const onUpdateUserReferredByAffiliateIdRequest = functions.firestore
  .document('users/{userId}/requests/referredByAffiliateId')
  .onUpdate(async (snapshot, _context) => {


    // TODO: handle only if user.readOnly.referredByAffiliateId is unset and user created within the last hour
    if (request.referredByAffiliateId) {
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

  });*/
