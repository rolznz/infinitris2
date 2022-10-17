import { getDb, increment } from '../utils/firebase';
import {
  getUserPath,
  InvoiceData,
  IUser,
  objectToDotNotation,
} from 'infinitris2-models';

export async function processBuyCoins(
  data: InvoiceData & { type: 'buyCoins' }
): Promise<void> {
  console.log('buy coins: ' + JSON.stringify(data));
  const userRef = getDb().doc(getUserPath(data.userId));
  const updateUserCoins = objectToDotNotation<IUser>(
    {
      readOnly: {
        coins: increment(data.amount),
      },
    },
    ['readOnly.coins']
  );

  await userRef.update(updateUserCoins);
}
