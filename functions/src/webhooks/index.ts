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
import { updateChallengePreviewImagesWebhook } from './migrations/updateChallengePreviewImagesWebhook';
import { updateChallengeAttemptTopPlayerAttemptsWebhook } from './migrations/updateChallengeAttemptTopPlayerAttemptsWebhook';
import { updateChallengeTopAttemptsWebhook } from './migrations/updateChallengeTopAttemptsWebhook';
import { updateChallengeAttemptUserDataWebhook } from './migrations/updateChallengeAttemptUserDataWebhook';

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

// //////////////////////////////////////////////////////////
// MIGRATIONS - note: may take a long time to run
// //////////////////////////////////////////////////////////
app.post(
  '/v1/migrations/challenges/preview-images',
  updateChallengePreviewImagesWebhook
);
app.post(
  '/v1/migrations/challenges/top-attempts',
  updateChallengeTopAttemptsWebhook
);
app.post(
  '/v1/migrations/challenge-attempts/user-data',
  updateChallengeAttemptUserDataWebhook
);
app.post(
  '/v1/migrations/challenge-attempts/top-player-attempts',
  updateChallengeAttemptTopPlayerAttemptsWebhook
);
// //////////////////////////////////////////////////////////

// expose for testing only
export const webhooksExpressApp = app;

// Expose Express API as a single Cloud Function:
export const webhooks = functions.https.onRequest(app);
