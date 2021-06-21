import { getDb } from './firebase';
import firebase from 'firebase';
import IUpdateUserReadOnly from '../models/IUpdateUserReadOnly';
import { usersPath } from 'infinitris2-models';

/**
 * Gives all users one credit
 * TODO: consider using a batched operation
 */
export default async function scheduledCreditReward(): Promise<void> {
  const querySnapshot = await getDb().collection(usersPath).get();

  await Promise.all(
    querySnapshot.docs.map((doc) => {
      const updateUserRequest: IUpdateUserReadOnly = {
        'readOnly.credits': firebase.firestore.FieldValue.increment(1),
      };
      return doc.ref.update(updateUserRequest);
    })
  );
}
