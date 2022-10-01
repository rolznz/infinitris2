import * as functions from 'firebase-functions';
import {
  affiliatesPath,
  getUserPath,
  IAffiliate,
  IUser,
} from 'infinitris2-models';
import { getCurrentTimestamp, getDb } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';
import { postSimpleWebhook } from './utils/postSimpleWebhook';

export const onCreateAuthUser = functions.auth.user().onCreate(async (user) => {
  try {
    if (!user.email) {
      throw new Error(`No email provided for user ${user.uid}`);
    }
    const userRef = getDb().doc(getUserPath(user.uid));

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      const affiliateRef = getDb().collection(affiliatesPath).doc();
      const affiliateToCreate: IAffiliate = {
        readOnly: {
          ...getDefaultEntityReadOnlyProperties(),
          numConversions: 0,
        },
        userId: user.uid,
        created: true,
      };

      await affiliateRef.set(affiliateToCreate);

      const newUser: IUser = {
        readOnly: {
          ...getDefaultEntityReadOnlyProperties(),
          email: user.email!,
          coins: 3,
          networkImpact: 0,
          affiliateId: affiliateRef.id,
          numWrites: 0,
          writeRate: 0,
          lastWriteTimestamp: getCurrentTimestamp(),
          characterIds: [],
        },
        userId: user.uid,
        created: true,
      };
      await userRef.set(newUser);

      await postSimpleWebhook('premium', 'new premium signup!');
    } else {
      throw new Error(`Could not create user ${user.uid} - already exists`);
    }
  } catch (error) {
    console.error(error);
  }
});
