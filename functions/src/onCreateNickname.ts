import * as functions from 'firebase-functions';
import {
  getUserPath,
  INickname,
  IUser,
  nicknamesPath,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';

export const onCreateNickname = functions.firestore
  .document('nicknames/{nicknameId}')
  .onCreate(async (snapshot, context) => {
    try {
      const nicknameId = context.params.nicknameId;
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }

      // delete any old nicknames attached to the user
      const userOldNicknames = await getDb()
        .collection(nicknamesPath)
        .where('readOnly.userId', '==', userId)
        .where('created', '==', true)
        .get();
      for (const oldUserNickname of userOldNicknames.docs) {
        await oldUserNickname.ref.delete();
      }

      // const nickname = snapshot.data() as INickname;
      const userDocRef = getDb().doc(getUserPath(userId));
      // const user = (await userDocRef.get()).data() as IUser;

      // assign the nickname to the user
      const updateUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            nickname: nicknameId,
          },
        },
        ['readOnly.nickname']
      );
      await userDocRef.update(updateUser);

      // assign the user's id to the nickname
      await snapshot.ref.update({
        readOnly: {
          ...getDefaultEntityReadOnlyProperties(),
          userId,
        },
        created: true,
      } as Pick<INickname, 'readOnly' | 'created'>);
    } catch (error) {
      console.error(error);
    }
  });