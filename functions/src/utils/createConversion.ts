import firebase from 'firebase';
import {
  IReferredByAffiliateRequest,
  getAffiliatePath,
  getUserPath,
  IUser,
  IAffiliate,
  IConversion,
  getConversionPath,
} from 'infinitris2-models';
import IUpdateAffiliateReadOnly from '../models/IUpdateAffiliateReadOnly';
import IUpdateUserReadOnly from '../models/IUpdateUserReadOnly';
import { getDb } from './firebase';
import updateNetworkImpact from './updateNetworkImpact';

export default async function createConversion(
  convertedUserId: string,
  request: IReferredByAffiliateRequest
) {
  const affiliateDocRef = getDb().doc(
    getAffiliatePath(request.referredByAffiliateId)
  );
  const convertedUserRef = getDb().doc(getUserPath(convertedUserId));
  const convertedUser = (await convertedUserRef.get()).data() as IUser;
  if (convertedUser.readOnly.referredByAffiliateId) {
    throw new Error(
      'Referred by affiliate ID already set for user ' + convertedUserId
    );
  }

  const affiliateDoc = await affiliateDocRef.get();
  if (affiliateDoc.exists) {
    const affiliate = affiliateDoc.data() as IAffiliate;

    // mark the user as having been converted, plus reward them with 3 credits
    const updateUserRequest: IUpdateUserReadOnly = {
      'readOnly.referredByAffiliateId': request.referredByAffiliateId,
      'readOnly.credits': firebase.firestore.FieldValue.increment(3),
    };
    await convertedUserRef.update(updateUserRequest);

    // create the conversion
    const conversionRef = getDb().doc(
      getConversionPath(request.referredByAffiliateId, convertedUserId)
    );
    const conversion: IConversion = {
      readOnly: {
        createdTimestamp: firebase.firestore.Timestamp.now(),
      },
    };
    await conversionRef.set(conversion);

    // create network impact (+1 credit rewarded to affiliate user and anyone who impacted the affiliate user)
    await updateNetworkImpact(affiliate.readOnly.userId, convertedUserId);

    // give the affiliate user additional credits based on number of conversions
    const affiliateUserRef = getDb().doc(
      getUserPath(affiliate.readOnly.userId)
    );
    const updateAffiliateUserRequest: IUpdateUserReadOnly = {
      'readOnly.credits': firebase.firestore.FieldValue.increment(
        affiliate.readOnly.numConversions + 2
      ),
    };
    await affiliateUserRef.update(updateAffiliateUserRequest);

    // update the affiliate conversion count
    const updateAffiliateRequest: IUpdateAffiliateReadOnly = {
      'readOnly.numConversions': firebase.firestore.FieldValue.increment(1),
    };
    await affiliateDocRef.update(updateAffiliateRequest);
  }
}
