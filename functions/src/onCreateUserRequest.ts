import * as functions from 'firebase-functions';
import {
  IReferredByAffiliateRequest,
  UserRequestKey,
} from 'infinitris2-models';
import createConversion from './utils/createConversion';

export const onCreateUserRequest = functions.firestore
  .document('users/{userId}/requests/{requestId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }
      switch (snapshot.id as UserRequestKey) {
        case 'referredByAffiliate':
          await createConversion(
            userId,
            snapshot.data() as IReferredByAffiliateRequest
          );
          break;
        default:
          throw new Error('Unsupported user request: ' + snapshot.id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // already processed the request, now delete it
      await snapshot.ref.delete();
    }
  });