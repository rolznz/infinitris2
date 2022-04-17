import * as functions from 'firebase-functions';
import { StatusCodes } from 'http-status-codes';
import got from 'got';
import { InvoiceData } from 'infinitris2-models';

type CreateInvoiceRequest = {
  out: false;
  amount: number;
  memo?: string;
  webhook: string;
};

type CreateInvoiceResponse = {
  // eslint-disable-next-line camelcase
  payment_hash: string;
  // eslint-disable-next-line camelcase
  payment_request: string;
  // eslint-disable-next-line camelcase
  checking_id: string;
  // eslint-disable-next-line camelcase
  // "lnurl_response": null
};

export async function createInvoice(
  amount: number,
  data: InvoiceData,
  memo?: string
): Promise<string> {
  if (amount < 1) {
    throw new Error('amount must be positive');
  }
  const lightningApiUrl = functions.config().webhooks.lightning_api_url;
  const lightningApiKey = functions.config().webhooks.lightning_api_key;
  const webhookKey = functions.config().webhooks.key;
  const webhookUrl = functions.config().webhooks.url;

  const createInvoiceRequest: CreateInvoiceRequest = {
    out: false,
    amount,
    memo,
    webhook: `${webhookUrl}/v1/payments?key=${webhookKey}&data=${encodeURIComponent(
      JSON.stringify(data)
    )}`,
  };

  const response = await got.post(`${lightningApiUrl}/api/v1/payments`, {
    json: createInvoiceRequest,
    headers: {
      'X-Api-Key': lightningApiKey,
    },
  });
  if (response.statusCode === StatusCodes.CREATED) {
    const createInvoiceResponse = JSON.parse(
      response.body
    ) as CreateInvoiceResponse;
    return createInvoiceResponse.payment_request;
  } else {
    throw new Error(
      'Failed to create invoice: ' +
        response.statusCode +
        ' ' +
        response.statusMessage
    );
  }
}
