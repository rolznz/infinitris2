import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import {
  challengeAttemptsPath,
  getChallengeAttemptPath,
  IChallengeAttempt,
  IUser,
  objectToDotNotation,
  usersPath,
} from 'infinitris2-models';
import { getDb } from '../../utils/firebase';

export const updateChallengeAttemptUserDataWebhook = async (
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
    const users = await getDb().collection(usersPath).get();

    let challengeAttemptsUpdated = 0;
    const startTime = Date.now();
    for (const challengeAttemptDoc of challengeAttempts.docs) {
      const challengeAttempt = challengeAttemptDoc.data() as IChallengeAttempt;

      if (!challengeAttempt.readOnly?.user) {
        const user = users.docs
          .find((doc) => doc.id === challengeAttempt.userId)!
          .data() as IUser;
        if (user.readOnly.nickname && user.selectedCharacterId) {
          const updateChallengeAttempt = objectToDotNotation<IChallengeAttempt>(
            {
              readOnly: {
                user: {
                  nickname: user.readOnly.nickname,
                  selectedCharacterId: user.selectedCharacterId,
                },
              },
            },
            ['readOnly.user.nickname', 'readOnly.user.selectedCharacterId']
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
    }

    return res.json({ challengeAttemptsUpdated });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
