import { getDb } from './firebase';
import { IUser, objectToDotNotation, usersPath } from 'infinitris2-models';

/**
 * Updates all users one credit for users with credits < 3
 * TODO: consider using a batched operation
 */
export default async function scheduledCreditReward(): Promise<void> {
  const minCoins = 3;
  const querySnapshot = await getDb()
    .collection(usersPath)
    .where('readOnly.coins', '<', minCoins)
    .get();

  const updateUser = objectToDotNotation<IUser>(
    {
      readOnly: {
        coins: minCoins,
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
