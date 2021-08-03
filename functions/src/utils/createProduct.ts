import * as functions from 'firebase-functions';
import { IProduct } from 'infinitris2-models';
import { getDb } from './firebase';
import { getDefaultEntityReadOnlyProperties } from './getDefaultEntityReadOnlyProperties';

export async function createProduct(
  snapshot: functions.firestore.QueryDocumentSnapshot
) {
  try {
    // apply update using current database instance
    await getDb()
      .doc(snapshot.ref.path)
      .update({
        readOnly: {
          ...getDefaultEntityReadOnlyProperties(),
          numPurchases: 0,
        },
        created: true,
      } as Pick<IProduct, 'readOnly' | 'created'>);
  } catch (error) {
    console.error(error);
  }
}
