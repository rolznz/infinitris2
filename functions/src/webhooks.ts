import * as functions from 'firebase-functions';
import * as express from 'express';
import { getCurrentTimestamp, getDb } from './utils/firebase';
import { Donation } from 'infinitris2-models';
const app = express();
app.use(express.json());

type LNURLpRequest = {
  // eslint-disable-next-line camelcase
  payment_hash: string;
  // eslint-disable-next-line camelcase
  payment_request: string;
  amount: number;
  comment: string;
  extra: string;
  lnurlp: number;
};

app.post('/v1/donation', async (req, res) => {
  const body: LNURLpRequest = req.body;

  const donation: Donation = {
    amount: body.amount / 1000,
    comment: body.comment || '',
    createdTimestamp: getCurrentTimestamp(),
  };

  await getDb().collection('donations').add(donation);

  res.end();
});

// Expose Express API as a single Cloud Function:
export const webhooks = functions.https.onRequest(app);
