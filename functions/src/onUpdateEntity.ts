import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IEntity, objectToDotNotation } from 'infinitris2-models';

export const onUpdateEntity = functions.firestore
  .document('{collectionId}/{entityId}')
  .onUpdate(async (change) => {
    try {
      const data = change.after.data() as IEntity;
      const previousData = change.before.data() as IEntity;

      if (
        data.readOnly?.lastModifiedTimestamp?.seconds ===
          previousData.readOnly?.lastModifiedTimestamp?.seconds &&
        data.readOnly?.lastModifiedTimestamp?.nanoseconds ===
          previousData.readOnly?.lastModifiedTimestamp?.nanoseconds
      ) {
        const updateReadOnly = objectToDotNotation<IEntity>(
          {
            readOnly: {
              lastModifiedTimestamp: admin.firestore.Timestamp.now(),
              numTimesModified: (admin.firestore.FieldValue.increment(
                1
              ) as any) as number,
            },
          },
          ['readOnly.lastModifiedTimestamp', 'readOnly.numTimesModified']
        );

        await change.after.ref.update(updateReadOnly);
      }
    } catch (error) {
      console.error(error);
    }
  });
