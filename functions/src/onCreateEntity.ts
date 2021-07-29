import * as functions from 'firebase-functions';
import { updateUserRateLimit } from './utils/updateUserRateLimit';
import { getCurrentTimestamp } from './utils/firebase';

// This trigger only fires for top level collections.
// subcollections must have their own rules to avoid spam as user rate limits are not updated.
export const onCreateEntity = functions.firestore
  .document('{collectionId}/{entityId}')
  .onCreate(async (_snapshot, context: functions.EventContext) => {
    try {
      await updateUserRateLimit(context.auth?.uid, getCurrentTimestamp());
    } catch (error) {
      console.error(error);
    }
  });
