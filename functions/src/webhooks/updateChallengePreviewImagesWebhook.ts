import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { createChallengePreviewImages } from '../utils/createChallengePreviewImages';
import { challengesPath, IChallenge } from 'infinitris2-models';
import { getDb } from '../utils/firebase';

export const updateChallengePreviewImagesWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    const key = functions.config().webhooks.key;

    if (req.query['key'] !== key) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }

    const challenges = await getDb().collection(challengesPath).get();
    for (const challengeDoc of challenges.docs) {
      await createChallengePreviewImages(
        challengeDoc.id,
        challengeDoc.data() as IChallenge
      );
    }

    res.status(StatusCodes.NO_CONTENT);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
