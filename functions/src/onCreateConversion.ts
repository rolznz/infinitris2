import * as functions from 'firebase-functions';

import {
  getAffiliatePath,
  getUserPath,
  IUser,
  IAffiliate,
  IConversion,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb, increment } from './utils/firebase';
import updateNetworkImpact from './utils/updateNetworkImpact';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';

export const onCreateConversion = functions.firestore
  .document('affiliates/{affiliateId}/conversions/{convertedUserId}')
  .onCreate(async (snapshot, context) => {
    try {
      // const conversion = snapshot.data() as IConversion;
      const affiliateId: string = context.params.affiliateId;
      const convertedUserId: string = context.params.convertedUserId;

      const conversion = snapshot.data() as IConversion;
      const userId = conversion.userId;
      if (!userId) {
        throw new Error('User not logged in');
      }
      if (userId !== convertedUserId) {
        throw new Error(
          `User ID ${userId} does not match converted user ID ${convertedUserId}`
        );
      }

      const affiliateDocRef = getDb().doc(getAffiliatePath(affiliateId));
      const convertedUserRef = getDb().doc(getUserPath(convertedUserId));
      const convertedUser = (await convertedUserRef.get()).data() as IUser;
      if (convertedUser.readOnly.referredByAffiliateId) {
        throw new Error(
          'Referred by affiliate ID already set for user ' + convertedUserId
        );
      }

      const affiliateDoc = await affiliateDocRef.get();
      if (!affiliateDoc.exists) {
        throw new Error('Affiliate does not exist: ' + affiliateId);
      }

      const affiliate = affiliateDoc.data() as IAffiliate;

      // mark the referred user as having been converted, plus reward them with 3 coins
      const updateConvertedUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            referredByAffiliateId: affiliateId,
            coins: increment(3),
          },
        },
        ['readOnly.referredByAffiliateId', 'readOnly.coins']
      );

      await convertedUserRef.update(updateConvertedUser);

      // create network impact (+1 credit rewarded to affiliate user and anyone who impacted the affiliate user)
      await updateNetworkImpact(affiliate.userId, convertedUserId);

      // give the affiliate user additional coins based on number of conversions
      /* const affiliateUserRef = getDb().doc(
        getUserPath(affiliate.userId)
      );
      const updateAffiliateUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            coins: increment(affiliate.readOnly.numConversions + 2),
          },
        },
        ['readOnly.coins']
      );

      await affiliateUserRef.update(updateAffiliateUser);*/

      // update the affiliate conversion count
      const updateAffiliate = objectToDotNotation<IAffiliate>(
        {
          readOnly: {
            numConversions: increment(1),
          },
        },
        ['readOnly.numConversions']
      );
      await affiliateDocRef.update(updateAffiliate);

      const updateConversion = {
        readOnly: {
          ...getDefaultEntityReadOnlyProperties(),
        },
        created: true,
      } as Pick<IConversion, 'readOnly' | 'created'>;

      // apply update using current database instance
      await getDb().doc(snapshot.ref.path).update(updateConversion);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
