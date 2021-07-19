import * as functions from 'firebase-functions';

import firebase from 'firebase';
import {
  getAffiliatePath,
  getUserPath,
  IUser,
  IAffiliate,
  IConversion,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb } from './utils/firebase';
import updateNetworkImpact from './utils/updateNetworkImpact';
import * as admin from 'firebase-admin';

export const onCreateConversion = functions.firestore
  .document('affiliates/{affiliateId}/conversions/{convertedUserId}')
  .onCreate(async (snapshot, context) => {
    try {
      // const conversion = snapshot.data() as IConversion;
      const affiliateId: string = context.params.affiliateId;
      const convertedUserId: string = context.params.convertedUserId;

      const userId = context.auth?.uid;
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
      const updateConvertedUserReadOnly = objectToDotNotation<IUser>(
        {
          readOnly: {
            referredByAffiliateId: affiliateId,
            coins: (firebase.firestore.FieldValue.increment(
              3
            ) as any) as number,
          },
        },
        ['readOnly.referredByAffiliateId', 'readOnly.coins']
      );

      await convertedUserRef.update(updateConvertedUserReadOnly);

      // create network impact (+1 credit rewarded to affiliate user and anyone who impacted the affiliate user)
      await updateNetworkImpact(affiliate.readOnly.userId, convertedUserId);

      // give the affiliate user additional coins based on number of conversions
      const affiliateUserRef = getDb().doc(
        getUserPath(affiliate.readOnly.userId)
      );
      const updateAffiliateUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            coins: (firebase.firestore.FieldValue.increment(
              affiliate.readOnly.numConversions + 2
            ) as any) as number,
          },
        },
        ['readOnly.coins']
      );

      await affiliateUserRef.update(updateAffiliateUser);

      // update the affiliate conversion count
      const updateAffiliate = objectToDotNotation<IAffiliate>(
        {
          readOnly: {
            numConversions: (firebase.firestore.FieldValue.increment(
              1
            ) as any) as number,
          },
        },
        ['readOnly.numConversions']
      );
      await affiliateDocRef.update(updateAffiliate);

      const updateConversion = {
        readOnly: {
          // TODO: extract created/modified etc to utility function
          createdTimestamp: admin.firestore.Timestamp.now(),
          lastModifiedTimestamp: admin.firestore.Timestamp.now(),
          numTimesModified: 0,
        },
        created: true,
      } as Pick<IConversion, 'readOnly' | 'created'>;

      await snapshot.ref.update(updateConversion);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
