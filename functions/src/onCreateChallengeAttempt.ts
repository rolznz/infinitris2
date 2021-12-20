import * as functions from 'firebase-functions';
import {
  getChallengePath,
  IChallenge,
  IChallengeAttempt,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb, increment } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';

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
    } catch (error) {
      console.error(error);
    }
  });
