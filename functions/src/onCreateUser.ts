import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { IUser } from 'infinitris2-models';

export const onCreateUser = functions.firestore
  .document('users/{userId}')
  .onCreate((snapshot, _context) => {
    // give the user 3 credits
    // TODO: affiliate system reward
    return snapshot.ref.update({
      credits: 3,
      createdTimestamp: admin.firestore.Timestamp.now(),
    } as Pick<IUser, 'credits' | 'createdTimestamp'>);
  });
