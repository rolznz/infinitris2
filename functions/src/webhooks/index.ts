import * as functions from 'firebase-functions';
import * as express from 'express';
import { donationsWebhook } from './donationsWebhook';
import { updateServerWebhook } from './updateServerWebhook';
import { createUserWebhook } from './createUserWebhook';
import { paymentsWebhook } from './paymentsWebhook';
import { loginWebhook } from './loginWebhook';
import * as cors from 'cors';
import { buyCoinsWebhook } from './buyCoinsWebhook';
import { publicDataWebhook } from './publicDataWebhook';
import { testWebhook } from './testWebhook';
import { updateChallengePreviewImagesWebhook } from './updateChallengePreviewImagesWebhook';
import { updateChallengeAttemptsWebhook } from './updateChallengeAttemptsWebhook';

const corsHandler = cors({ origin: true });

const app = express();
app.use(corsHandler);
app.use(express.json());

app.post('/v1/users', createUserWebhook);
app.post('/v1/coins', buyCoinsWebhook);
app.post('/v1/donations', donationsWebhook);
app.post('/v1/payments', paymentsWebhook);
app.post('/v1/login', loginWebhook);
app.patch('/v1/servers/:serverId', updateServerWebhook);
app.get('/v1/public/:collectionId', publicDataWebhook);

app.post('/v1/test', testWebhook);
// TODO: remove - too slow to execute on all challenges
app.post(
  '/v1/update-challenge-preview-images',
  updateChallengePreviewImagesWebhook
);
// TODO: remove - too slow to execute on all challenges
app.post('/v1/update-challenge-attempts', updateChallengeAttemptsWebhook);

// expose for testing only
export const webhooksExpressApp = app;

// Expose Express API as a single Cloud Function:
export const webhooks = functions.https.onRequest(app);
