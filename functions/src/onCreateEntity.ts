import * as functions from 'firebase-functions';
import { updateUserRateLimit } from './utils/updateUserRateLimit';
import { getCurrentTimestamp } from './utils/firebase';
import { IEntity } from 'infinitris2-models';

// This trigger only fires for top level collections.
// subcollections must have their own rules to avoid spam as user rate limits are not updated.
export const onCreateEntity = functions.firestore
  .document('{collectionId}/{entityId}')
  .onCreate(async (snapshot, context: functions.EventContext) => {
    try {
      const entity = snapshot.data() as IEntity;
      if (!entity.userId) {
        throw new Error(
          'No userId provided when creating ' +
            context.params.collectionId +
            '/' +
            context.params.entityId
        );
      }
      await updateUserRateLimit(entity.userId, getCurrentTimestamp());
    } catch (error) {
      console.error(error);
    }
  });
