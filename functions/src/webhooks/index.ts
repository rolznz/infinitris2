import * as functions from 'firebase-functions';
import * as express from 'express';
import { donationsWebhook } from './donationsWebhook';
import { serversWebhook } from './serversWebhook';

const app = express();
app.use(express.json());

app.post('/v1/donations', donationsWebhook);
app.patch('/v1/servers/:serverId', serversWebhook);

// expose for testing only
export const webhooksExpressApp = app;

// Expose Express API as a single Cloud Function:
export const webhooks = functions.https.onRequest(app);
