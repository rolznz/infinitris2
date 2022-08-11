import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import {
  challengeAttemptsPath,
  getChallengeAttemptPath,
  IChallengeAttempt,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb } from '../../utils/firebase';

export const updateChallengeAttemptTopPlayerAttemptsWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    const key = functions.config().webhooks.key;

    if (req.query['key'] !== key) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }

    const challengeAttempts = await getDb()
      .collection(challengeAttemptsPath)
      .get();

    let challengeAttemptsUpdated = 0;
    const startTime = Date.now();
    const topAttempts = challengeAttempts.docs.filter(
      (doc) =>
        !challengeAttempts.docs.some(
          (other) =>
            (other.data() as IChallengeAttempt).userId ===
              (doc.data() as IChallengeAttempt).userId &&
            (other.data() as IChallengeAttempt).challengeId ===
              (doc.data() as IChallengeAttempt).challengeId &&
            (other.data() as IChallengeAttempt).stats.timeTakenMs <
              (doc.data() as IChallengeAttempt).stats.timeTakenMs
        )
    );

    for (const challengeAttemptDoc of topAttempts) {
      const challengeAttempt = challengeAttemptDoc.data() as IChallengeAttempt;

      if (!challengeAttempt.readOnly?.isPlayerTopAttempt) {
        const updateChallengeAttempt = objectToDotNotation<IChallengeAttempt>(
          {
            readOnly: {
              isPlayerTopAttempt: true,
            },
          },
          ['readOnly.isPlayerTopAttempt']
        );
        await getDb()
          .doc(getChallengeAttemptPath(challengeAttemptDoc.id))
          .update(updateChallengeAttempt);

        console.log(challengeAttemptsUpdated);
        ++challengeAttemptsUpdated;
        if (Date.now() - startTime > 50000) {
          break;
        }
      }
    }

    return res.json({ challengeAttemptsUpdated });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
