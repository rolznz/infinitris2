import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const testWebhook = async (req: Request, res: Response) => {
  try {
    const key = functions.config().webhooks.key;

    if (req.query['key'] !== key) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }
    console.log('TEST WEBHOOK ', req.url);
    res.status(StatusCodes.NO_CONTENT);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};
