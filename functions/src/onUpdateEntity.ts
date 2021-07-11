import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IEntity } from 'infinitris2-models';
import IUpdateEntityReadOnly from './models/IUpdateEntityReadOnly';

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
        const updateReadOnly: IUpdateEntityReadOnly = {
          'readOnly.lastModifiedTimestamp': admin.firestore.Timestamp.now(),
          'readOnly.numTimesModified': admin.firestore.FieldValue.increment(1),
        };
        await change.after.ref.update(updateReadOnly);
      }
    } catch (error) {
      console.error(error);
    }
  });
