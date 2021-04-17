import { db } from './constants';
import * as admin from 'firebase-admin';
import { IUser } from 'infinitris2-models';

/**
 * Gives all users one credit
 */
export default function scheduledCreditReward() {
  return db
    .collection('users')
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        doc.ref.update({
          credits: (admin.firestore.FieldValue.increment(1) as any) as number,
        } as Pick<IUser, 'credits'>);
      });
    });
}
