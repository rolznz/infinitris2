import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { challengesPath, IChallenge, verifyProperty } from 'infinitris2-models';
import { getDb } from '../../utils/firebase';
import { updateChallengeTopAttempts } from '../..';

export const updateChallengeTopAttemptsWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    const key = functions.config().webhooks.key;

    if (req.query['key'] !== key) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }

    const challenges = await getDb()
      .collection(challengesPath)
      .orderBy(verifyProperty<IChallenge>('readOnly.numAttempts'), 'desc')
      .get();

    let challengesUpdated = 0;
    const startTime = Date.now();
    for (const challengeDoc of challenges.docs) {
      const challenge = challengeDoc.data() as IChallenge;

      if (
        (challenge.readOnly?.numAttempts || 0) > 0 &&
        (challenge.readOnly?.topAttempts?.length || 0) === 0
      ) {
        await updateChallengeTopAttempts(challengeDoc.id, challengeDoc.ref);

        console.log(challengesUpdated);
        ++challengesUpdated;
        if (Date.now() - startTime > 50000) {
          break;
        }
      }
    }

    return res.json({ challengeAttemptsUpdated: challengesUpdated });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
