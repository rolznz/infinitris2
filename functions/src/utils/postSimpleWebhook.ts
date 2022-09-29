import * as functions from 'firebase-functions';
import got from 'got';

export async function postSimpleWebhook(
  destination: 'challenges' | 'multiplayer',
  content: string
): Promise<boolean> {
  try {
    const webhookKey = `simple_output_webhook_url_${destination}`;
    const simpleWebhookUrl = functions.config().webhooks[webhookKey];
    if (!simpleWebhookUrl) {
      throw new Error(`No ${webhookKey} set`);
    }
    const result = await got.post(simpleWebhookUrl, {
      json: {
        content,
      },
    });
    if (result.statusCode === 204) {
      return true;
    } else {
      console.error(
        'Received unexpected status code',
        result.statusCode,
        result.statusMessage
      );
    }
  } catch (error) {
    console.error('Failed to post to simple webhook', error);
  }
  return false;
}
