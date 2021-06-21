import { getDb } from './firebase';
import * as admin from 'firebase-admin';
import IUpdateUserReadOnly from '../models/IUpdateUserReadOnly';

/**
 * Gives all users one credit
 */
export default function scheduledCreditReward() {
  return getDb()
    .collection('users')
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        const updateUserRequest: IUpdateUserReadOnly = {
          'readOnly.credits': admin.firestore.FieldValue.increment(1),
        };
        doc.ref.update(updateUserRequest);
      });
    });
}
