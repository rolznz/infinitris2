import * as functions from 'firebase-functions';
import got from 'got';

export async function postSimpleWebhook(content: string): Promise<boolean> {
  try {
    const simpleWebhookUrl =
      functions.config().webhooks.simple_output_webhook_url;
    if (!simpleWebhookUrl) {
      throw new Error('No webhooks.simple_output_webhook_url set');
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
