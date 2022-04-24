import * as functions from 'firebase-functions';
import { IEntity, objectToDotNotation, usersPath } from 'infinitris2-models';
import { updateUserRateLimit } from './utils/updateUserRateLimit';
import { getCurrentTimestamp, getDb, increment } from './utils/firebase';

// This trigger only fires for top level collections.
// subcollections must have their own rules to avoid spam as user rate limits are not updated.
export const onUpdateEntity = functions.firestore
  .document('{collectionId}/{entityId}')
  .onUpdate(async (change, context: functions.EventContext) => {
    try {
      const data = change.after.data() as IEntity;
      const previousData = change.before.data() as IEntity;

      if (
        data.readOnly?.lastModifiedTimestamp?.seconds ===
          previousData.readOnly?.lastModifiedTimestamp?.seconds &&
        data.readOnly?.lastModifiedTimestamp?.nanoseconds ===
          previousData.readOnly?.lastModifiedTimestamp?.nanoseconds
      ) {
        const currentTime = getCurrentTimestamp();

        const entity = data as IEntity;
        if (!entity.userId) {
          throw new Error(
            'No userId provided when updating ' +
              context.params.collectionId +
              '/' +
              context.params.entityId
          );
        }

        const updateReadOnly = objectToDotNotation<IEntity>(
          {
            readOnly: {
              lastModifiedTimestamp: currentTime,
              numTimesModified: increment(1),
            },
          },
          ['readOnly.lastModifiedTimestamp', 'readOnly.numTimesModified']
        );

        const isUser = context.params.collectionId === usersPath;

        await updateUserRateLimit(
          entity.userId,
          currentTime,
          isUser ? updateReadOnly : undefined
        );

        if (!isUser) {
          // apply update using current database instance
          await getDb().doc(change.after.ref.path).update(updateReadOnly);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
