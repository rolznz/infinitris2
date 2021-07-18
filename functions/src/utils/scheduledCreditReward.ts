import { getDb } from './firebase';
import firebase from 'firebase';
import { IUser, usersPath } from 'infinitris2-models';
import { objectToDotNotation } from '../onCreateConversion';

/**
 * Gives all users one credit
 * TODO: consider using a batched operation
 */
export default async function scheduledCreditReward(): Promise<void> {
  const querySnapshot = await getDb().collection(usersPath).get();

  const updateUser = objectToDotNotation<IUser>(
    {
      readOnly: {
        coins: (firebase.firestore.FieldValue.increment(1) as any) as number,
      },
    },
    ['readOnly.coins']
  );

  await Promise.all(
    querySnapshot.docs.map((doc) => {
      return doc.ref.update(updateUser);
    })
  );
}
