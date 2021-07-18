import * as functions from 'firebase-functions';

import firebase from 'firebase';
import {
  getAffiliatePath,
  getUserPath,
  IUser,
  IAffiliate,
  IConversion,
} from 'infinitris2-models';
import { getDb } from './utils/firebase';
import updateNetworkImpact from './utils/updateNetworkImpact';

// TODO: move to models project
// from https://stackoverflow.com/a/51365037/4562693
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

// https://stackoverflow.com/a/65333050/4562693
export type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

// TODO: improve typing to force obj to match allowedKeys rather than having to check at runtime
export function objectToDotNotation<T extends Object>(
  obj: RecursivePartial<Required<T>>,
  allowedKeys: RecursiveKeyOf<Required<T>>[]
) {
  const result = objectToDotNotationInternal(obj, allowedKeys);
  const resultKeys = Object.keys(result);
  if (resultKeys.sort().join(',') !== allowedKeys.sort().join(',')) {
    throw new Error(
      `Unexpected result: ${JSON.stringify(resultKeys)} != ${JSON.stringify(
        allowedKeys
      )}`
    );
  }

  return result;
}

// inspired by https://stackoverflow.com/a/54907553/4562693
function objectToDotNotationInternal<T extends Object>(
  obj: any,
  allowedKeys: RecursiveKeyOf<T>[],
  parent: string[] = [],
  keyValue: { [key: string]: T[Extract<keyof T, string>] } = {}
): { [key: string]: Object } {
  // eslint-disable-next-line guard-for-in
  for (const key in obj) {
    const pathParts = [...parent, key];
    const fullPath = pathParts.join('.');
    if (allowedKeys.indexOf(fullPath as RecursiveKeyOf<T>) >= 0) {
      keyValue[fullPath] = obj[key];
      continue;
    } else if (obj[key] !== null && typeof obj[key] === 'object') {
      Object.assign(
        keyValue,
        objectToDotNotationInternal(obj[key], allowedKeys, pathParts, keyValue)
      );
    }
  }
  return keyValue;
}

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
        throw new Error('User ID does not match converted user ID');
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
      console.log('updateUserReadOnly', updateConvertedUserReadOnly);

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
        ['readOnly.referredByAffiliateId', 'readOnly.coins']
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
          createdTimestamp: firebase.firestore.Timestamp.now(),
          lastModifiedTimestamp: firebase.firestore.Timestamp.now(),
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
