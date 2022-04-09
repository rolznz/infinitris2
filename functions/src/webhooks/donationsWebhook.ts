import * as functions from 'firebase-functions';
import { getCurrentTimestamp, getDb } from '../utils/firebase';
import { Donation } from 'infinitris2-models';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';

export type LNURLpRequest = {
  // eslint-disable-next-line camelcase
  payment_hash: string;
  // eslint-disable-next-line camelcase
  payment_request: string;
  amount: number;
  comment: string;
  extra: string;
  lnurlp: number;
};

export const donationsWebhook = async (req: Request, res: Response) => {
  const body: LNURLpRequest = req.body;
  const key = functions.config().webhooks.key;

  if (req.query['key'] !== key) {
    res.status(StatusCodes.UNAUTHORIZED);
    res.end();
    return;
  }

  const donation: Donation = {
    amount: body.amount / 1000,
    comment: body.comment || '',
    createdTimestamp: getCurrentTimestamp(),
  };

  await getDb().collection('donations').add(donation);
  res.status(204);
  res.end();
};
