import * as functions from 'firebase-functions';
import { createProduct } from './utils/createProduct';

export const onCreateColor = functions.firestore
  .document('colors/{colorId}')
  .onCreate(async (snapshot) => {
    await createProduct(snapshot);
  });
