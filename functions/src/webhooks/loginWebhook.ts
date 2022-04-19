import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getLoginCodePath, LoginRequest, LoginCode } from 'infinitris2-models';
import {
  createCustomLoginToken,
  getCurrentTimestamp,
  getDb,
  getUserByEmail,
  increment,
} from '../utils/firebase';
let LAST_REQ_MS = 0;

/**
 * Custom login that sends a code to the user's email.
 * User needs to input the code in the PWA therefore it is not ideal to use a login link
 * https://stackoverflow.com/questions/65965020
 */
export const loginWebhook = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    if (now - LAST_REQ_MS < 1000) {
      res.status(StatusCodes.TOO_MANY_REQUESTS);
      return res.send();
    }
    LAST_REQ_MS = now;
    const loginRequest: LoginRequest = req.body;

    if (!loginRequest.email) {
      res.status(StatusCodes.BAD_REQUEST);
      return res.send();
    }

    const loginCodeRef = getDb().doc(getLoginCodePath(loginRequest.email));

    let loginCode = (await loginCodeRef.get()).data() as LoginCode | undefined;

    if (!loginCode || !loginRequest.code) {
      if (
        loginCode &&
        getCurrentTimestamp().seconds - loginCode.createdDateTime.seconds < 60
      ) {
        res.status(StatusCodes.TOO_MANY_REQUESTS);
        return res.send();
      }

      const user = await getUserByEmail(loginRequest.email);
      if (!user) {
        console.error("Couldn't find user by email: ", loginRequest.email);
        res.status(StatusCodes.NOT_FOUND);
        return res.send();
      }

      loginCode = {
        code: Math.random().toString(16).slice(6).toUpperCase(),
        createdDateTime: getCurrentTimestamp(),
        numAttempts: 0,
      };
      await loginCodeRef.set(loginCode);

      if (1 + 3 > 2) {
        throw new Error('Send email');
      }

      res.status(StatusCodes.NO_CONTENT);
      return res.send();
    }

    if (loginRequest.code === loginCode.code && loginCode.numAttempts < 3) {
      await loginCodeRef.delete();
      const customToken = await createCustomLoginToken(loginRequest.email);
      res.status(StatusCodes.CREATED);
      res.json(customToken);
      return res.send(customToken);
    } else {
      await loginCodeRef.update({
        numAttempts: increment(1),
      });
      res.status(StatusCodes.CONFLICT);
      return res.send();
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
