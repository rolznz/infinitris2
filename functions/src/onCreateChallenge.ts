import * as functions from 'firebase-functions';
import {
  getUserPath,
  IChallenge,
  IUser,
  objectToDotNotation,
  removeUndefinedValues,
} from 'infinitris2-models';
import { createChallengePreviewImages } from './utils/createChallengePreviewImages';
import { getDb, increment } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';
import { postSimpleWebhook } from './utils/postSimpleWebhook';

export const onCreateChallenge = functions.firestore
  .document('challenges/{challengeId}')
  .onCreate(async (snapshot) => {
    try {
      const challenge = snapshot.data() as IChallenge;
      const userId = challenge.userId;
      if (!userId) {
        throw new Error('User not logged in');
      }

      // reduce the number of coins the user has so they
      // cannot create an infinite number of challenges
      const userDocRef = getDb().doc(getUserPath(userId));

      const updateUser = objectToDotNotation<IUser>(
        {
          readOnly: {
            coins: increment(-1),
          },
        },
        ['readOnly.coins']
      );

      await userDocRef.update(updateUser);

      const user = await userDocRef.get();
      const userData = user.data() as IUser;

      // apply update using current database instance
      await getDb()
        .doc(snapshot.ref.path)
        .update({
          readOnly: {
            ...getDefaultEntityReadOnlyProperties(),
            userId,
            numRatings: 0,
            rating: 0,
            summedRating: 0,
            numAttempts: 0,
            ...removeUndefinedValues({
              user: {
                nickname: userData.readOnly?.nickname,
              },
            }),
          },
          created: true,
        } as Pick<IChallenge, 'readOnly' | 'created'>);

      if (!challenge.isOfficial && !challenge.isTemplate) {
        await postSimpleWebhook(
          'challenges',
          'New challenge published: ' +
            (challenge.title ?? 'Unnamed') +
            ' by ' +
            (userData.readOnly?.nickname ?? 'Unknown') +
            '\n\n' +
            `https://infinitris.net/challenges/${snapshot.ref.id}`
        );
      }
      await createChallengePreviewImages(snapshot.ref.id, challenge);
    } catch (error) {
      console.error(error);
    }
  });
