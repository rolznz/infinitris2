import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { createChallengePreviewImages } from '../../utils/createChallengePreviewImages';
import {
  challengesPath,
  getChallengePath,
  getUserPath,
  IChallenge,
  IUser,
  objectToDotNotation,
} from 'infinitris2-models';
import { getDb } from '../../utils/firebase';

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

    let thumbnailsGenerated = 0;
    let nicknamesGenerated = 0;
    const startTime = Date.now();
    for (const challengeDoc of challenges.docs) {
      const challenge = challengeDoc.data() as IChallenge;
      if (!challenge.readOnly?.thumbnail) {
        await createChallengePreviewImages(challengeDoc.id, challenge);
        ++thumbnailsGenerated;
        if (Date.now() - startTime > 30000) {
          break;
        }
      }
      if (!challenge.readOnly?.user?.nickname) {
        const userDocRef = getDb().doc(getUserPath(challenge.userId));
        const user = await userDocRef.get();
        const userData = user.data() as IUser;
        if (userData?.readOnly?.nickname) {
          const updateChallenge = objectToDotNotation<IChallenge>(
            {
              readOnly: {
                user: {
                  nickname: userData.readOnly.nickname,
                },
              },
            },
            ['readOnly.user.nickname']
          );
          await getDb()
            .doc(getChallengePath(challengeDoc.id))
            .update(updateChallenge);
          ++nicknamesGenerated;
          if (Date.now() - startTime > 30000) {
            break;
          }
        }
      }
    }

    return res.json({ thumbnailsGenerated, nicknamesGenerated });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
