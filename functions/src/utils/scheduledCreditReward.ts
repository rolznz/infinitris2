import { getDb, increment } from './firebase';
import { IUser, objectToDotNotation, usersPath } from 'infinitris2-models';

/**
 * Gives all users one credit
 * TODO: consider using a batched operation
 */
export default async function scheduledCreditReward(): Promise<void> {
  const querySnapshot = await getDb().collection(usersPath).get();

  const updateUser = objectToDotNotation<IUser>(
    {
      readOnly: {
        coins: increment(1),
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
