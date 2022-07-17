import * as functions from 'firebase-functions';
import {
  getChallengePath,
  getUserPath,
  IChallenge,
  IChallengeAttempt,
  IUser,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb, increment } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';
import { postSimpleWebhook } from './utils/postSimpleWebhook';

export const onCreateChallengeAttempt = functions.firestore
  .document('challengeAttempts/{challengeAttemptId}')
  .onCreate(async (snapshot) => {
    try {
      const challengeAttempt = snapshot.data() as IChallengeAttempt;
      const userId = challengeAttempt.userId;
      if (!userId) {
        throw new Error('User not logged in');
      }
      const challengeRef = getDb().doc(
        getChallengePath(challengeAttempt.challengeId)
      );

      const updateChallenge = objectToDotNotation<IChallenge>(
        {
          readOnly: {
            numAttempts: increment(1),
          },
        },
        ['readOnly.numAttempts']
      );
      await challengeRef.update(updateChallenge);

      // apply update using current database instance
      await getDb()
        .doc(snapshot.ref.path)
        .update({
          readOnly: {
            ...getDefaultEntityReadOnlyProperties(),
            userId,
          },
          created: true,
        } as Pick<IChallengeAttempt, 'readOnly' | 'created'>);

      const topAttempts = await getDb()
        .collection('challengeAttempts')
        .where('challengeId', '==', challengeAttempt.challengeId)
        .orderBy('stats.timeTakenMs')
        .limit(2)
        .get();
      if (
        topAttempts.docs.length < 2 ||
        (topAttempts.docs[0].id === snapshot.id &&
          (topAttempts.docs[1].data() as IChallengeAttempt).userId !== userId)
      ) {
        const userDocRef = getDb().doc(getUserPath(userId));
        const userDoc = await userDocRef.get();
        const userData = userDoc.data() as IUser;
        const challengeDoc = await challengeRef.get();
        const challengeData = challengeDoc.data() as IChallenge;
        postSimpleWebhook(
          `${
            userData.readOnly.nickname || 'Unknown user'
          } took first place on ${
            challengeData.title || 'Unnamed challenge'
          } with a time of ${(
            challengeAttempt.stats.timeTakenMs / 1000
          ).toFixed(
            2
          )}s\n\nView their replay or try for a faster time: https://infinitris.net/challenges/${
            challengeAttempt.challengeId
          }`
        );
      }
    } catch (error) {
      console.error(error);
    }
  });
