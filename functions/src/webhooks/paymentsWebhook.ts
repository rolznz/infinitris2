import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import { getDefaultEntityReadOnlyProperties } from '../utils/getDefaultEntityReadOnlyProperties';
import { createFirebaseUser, getDb } from '../utils/firebase';
import { getPaymentPath, InvoiceData, IPayment } from 'infinitris2-models';

export type PaidInvoice = {
  // eslint-disable-next-line camelcase
  checking_id: string;
  pending: boolean;
  amount: number;
  fee: number;
  memo: string;
  time: number;
  bolt11: string;
  preimage: string;
  // eslint-disable-next-line camelcase
  payment_hash: string;
  // extra: Object;
  // eslint-disable-next-line camelcase
  wallet_id: string;
  // webhook_status will be set after this webhook runs, can be retrieved by checking the invoice
  // using GET `${webhookUrl}/v1/payments/${payment_hash}`
  // eslint-disable-next-line camelcase
  // webhook_status: null;
};

export const paymentsWebhook = async (req: Request, res: Response) => {
  try {
    const invoice: PaidInvoice = req.body;
    console.log('PAYMENT RECEIVED ', req.url, invoice.payment_hash);
    const key = functions.config().webhooks.key;

    if (req.query['key'] !== key) {
      res.status(StatusCodes.UNAUTHORIZED);
      return res.send();
    }

    const data = JSON.parse(
      decodeURIComponent(req.query['data'] as string)
    ) as InvoiceData;

    // save the payment
    const paymentRef = getDb().doc(getPaymentPath(invoice.payment_hash));
    const payment: IPayment = {
      ...data,
      readOnly: {
        ...getDefaultEntityReadOnlyProperties(),
      },
      created: true,
      status: 'pending',
      amount: invoice.amount / 1000,
      memo: invoice.memo,
    };
    await paymentRef.set(payment);

    await processPayment(data, invoice.payment_hash);

    res.status(StatusCodes.NO_CONTENT);
    return res.send();
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.send();
  }
};

async function processPayment(data: InvoiceData, paymentHash: string) {
  try {
    switch (data.type) {
      case 'createUser':
        await processCreateUser(data, paymentHash);
        break;
      default:
        throw new Error(
          'Unsupported invoice type: ' + data.type + ' ' + JSON.stringify(data)
        );
    }
    const paymentUpdate: Partial<IPayment> = {
      status: 'completed',
    };
    await getDb().doc(getPaymentPath(paymentHash)).update(paymentUpdate);
  } catch (error) {
    console.error(error);
    const paymentUpdate: Partial<IPayment> = {
      status: 'failed',
    };
    await getDb().doc(getPaymentPath(paymentHash)).update(paymentUpdate);
  }
}
async function processCreateUser(
  data: InvoiceData,
  paymentHash: string
): Promise<void> {
  console.log('create user: ' + JSON.stringify(data));
  await createFirebaseUser(data.email);
}
