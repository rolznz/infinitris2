import * as functions from 'firebase-functions';
import {
  challengeAttemptsPath,
  getChallengeAttemptPath,
  getChallengePath,
  IChallenge,
  IChallengeAttempt,
  IIssueReport,
  objectToDotNotation,
  verifyProperty,
} from 'infinitris2-models';
import {
  updateChallengeTopAttempts,
  updatePlayerTopChallengeAttempt,
} from './onCreateChallengeAttempt';
import { getDb, increment } from './utils/firebase';
import { getDefaultEntityReadOnlyProperties } from './utils/getDefaultEntityReadOnlyProperties';

export const onCreateIssueReport = functions.firestore
  .document('issueReports/{issueReportId}')
  .onCreate(async (snapshot) => {
    try {
      const issueReport = snapshot.data() as IIssueReport;
      if (issueReport.entityCollectionPath !== 'challengeAttempts') {
        throw new Error(
          'Unsupported issue report entity collection: ' +
            issueReport.entityCollectionPath
        );
      }
      // TODO: check for a minimum number of reports per challenge attempt before continuing

      const challengeAttemptId = issueReport.entityId;
      const challengeAttemptRef = getDb().doc(
        getChallengeAttemptPath(challengeAttemptId)
      );
      const challengeAttemptDoc = await challengeAttemptRef.get();

      if (challengeAttemptDoc.exists) {
        const challengeAttempt =
          challengeAttemptDoc.data() as IChallengeAttempt;
        const challengeId = challengeAttempt.challengeId;
        const challengeRef = getDb().doc(getChallengePath(challengeId));

        // delete this attempt
        await challengeAttemptRef.delete();

        // decrease the number of attempts on the challenge
        const updateChallenge = objectToDotNotation<IChallenge>(
          {
            readOnly: {
              numAttempts: increment(-1),
            },
          },
          ['readOnly.numAttempts']
        );
        await challengeRef.update(updateChallenge);

        // if challengeAttempt is player's top attempt, try choose a new pb for the player
        if (challengeAttempt.readOnly?.isPlayerTopAttempt) {
          const playerTopAttempts = await getDb()
            .collection(challengeAttemptsPath)
            .where(
              verifyProperty<IChallengeAttempt>('challengeId'),
              '==',
              challengeAttempt.challengeId
            )
            .where(
              verifyProperty<IChallengeAttempt>('userId'),
              '==',
              challengeAttempt.userId
            )
            .orderBy(verifyProperty<IChallengeAttempt>('stats.timeTakenMs'))
            .limit(1)
            .get();
          if (playerTopAttempts.docs.length) {
            await updatePlayerTopChallengeAttempt(
              playerTopAttempts.docs[0].data() as IChallengeAttempt,
              playerTopAttempts.docs[0].ref
            );
          }
        }

        await updateChallengeTopAttempts(challengeId, challengeRef);
      }

      await getDb()
        .doc(snapshot.ref.path)
        .update({
          readOnly: {
            ...getDefaultEntityReadOnlyProperties(),
          },
          created: true,
        } as Pick<IChallengeAttempt, 'readOnly' | 'created'>);
    } catch (error) {
      console.error(error);
    }
  });
