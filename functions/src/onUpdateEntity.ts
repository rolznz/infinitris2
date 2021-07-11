import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IEntity } from 'infinitris2-models';
import IUpdateEntityReadOnly from './models/IUpdateEntityReadOnly';
import firebase from 'firebase';

export const onUpdateEntity = functions.firestore
  .document('{collectionId}/{entityId}')
  .onUpdate(async (change) => {
    try {
      const data = change.after.data() as IEntity;
      const previousData = change.before.data() as IEntity;

      if (
        data.readOnly?.lastModifiedTimestamp ===
        previousData.readOnly?.lastModifiedTimestamp
      ) {
        const updateReadOnly: IUpdateEntityReadOnly = {
          'readOnly.lastModifiedTimestamp': admin.firestore.Timestamp.now(),
          'readOnly.numTimesModified': firebase.firestore.FieldValue.increment(
            1
          ),
        };
        await change.after.ref.update(updateReadOnly);
      }
    } catch (error) {
      console.error(error);
    }
  });
