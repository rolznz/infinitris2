import * as functions from 'firebase-functions';
import {
  getEntityPath,
  getUserPath,
  IProduct,
  IPurchase,
  IUser,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb, increment } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';

export const onCreatePurchase = functions.firestore
  .document('purchases/{purchaseId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }
      const purchase = snapshot.data() as IPurchase;

      const productDocRef = getDb().doc(
        getEntityPath(purchase.entityCollectionPath, purchase.entityId)
      );

      const product = (await productDocRef.get()).data() as IProduct;

      const updateProduct = objectToDotNotation<IProduct>(
        {
          readOnly: {
            numPurchases: increment(1),
          },
        },
        ['readOnly.numPurchases']
      );

      productDocRef.update(updateProduct);

      const userDocRef = getDb().doc(getUserPath(userId));
      const user = (await userDocRef.get()).data() as IUser;
      const updateUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            coins: increment(-product.price),
            purchasedEntityIds: [
              ...user.readOnly.purchasedEntityIds,
              purchase.entityId,
            ],
          },
        },
        ['readOnly.coins', 'readOnly.purchasedEntityIds']
      );

      await userDocRef.update(updateUser);

      // apply update using current database instance
      await getDb()
        .doc(snapshot.ref.path)
        .update({
          readOnly: {
            ...getDefaultEntityReadOnlyProperties(),
            userId,
          },
          created: true,
        } as Pick<IPurchase, 'readOnly' | 'created'>);
    } catch (error) {
      console.error(error);
    }
  });
