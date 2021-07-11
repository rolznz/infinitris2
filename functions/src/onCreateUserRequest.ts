import * as functions from 'firebase-functions';
import { IReferredByAffiliateRequest, IUserRequest } from 'infinitris2-models';
import * as admin from 'firebase-admin';
import createConversion from './utils/createConversion';

export const onCreateUserRequest = functions.firestore
  .document('users/{userId}/requests/{requestId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userRequest = snapshot.data() as IUserRequest;
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }
      switch (userRequest.requestType) {
        case 'referredByAffiliate':
          await createConversion(
            userId,
            userRequest as IReferredByAffiliateRequest
          );
          break;
        default:
          throw new Error('Unsupported user request: ' + snapshot.id);
      }
      const updateUserRequest = {
        readOnly: {
          createdTimestamp: admin.firestore.Timestamp.now(),
          lastModifiedTimestamp: admin.firestore.Timestamp.now(),
          numTimesModified: 0,
        },
        created: true,
      } as Pick<IUserRequest, 'readOnly' | 'created'>;
      await snapshot.ref.update(updateUserRequest);
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
