import * as functions from 'firebase-functions';
import {
  getChallengePath,
  IChallenge,
  IChallengeAttempt,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';
import firebase from 'firebase';

export const onCreateChallengeAttempt = functions.firestore
  .document('challengeAttempts/{challengeAttemptId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userId = context.auth?.uid;
      if (!userId) {
        throw new Error('User not logged in');
      }
      const challengeAttempt = snapshot.data() as IChallengeAttempt;
      const challengeRef = getDb().doc(
        getChallengePath(challengeAttempt.challengeId)
      );

      const updateChallenge = objectToDotNotation<IChallenge>(
        {
          readOnly: {
            numAttempts: (firebase.firestore.FieldValue.increment(
              1
            ) as any) as number,
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
