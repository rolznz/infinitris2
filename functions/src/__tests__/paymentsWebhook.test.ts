import * as functions from 'firebase-functions';
import { setup } from './helpers/setup';
import './helpers/extensions';
import { InvoiceData, IPayment, paymentsPath } from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { PaidInvoice } from '../webhooks/paymentsWebhook';

test('createUser payment', async () => {
  const { db } = await setup(undefined, {}, false);

  functions.config().webhooks = {
    key: 'abc',
  };

  const paidInvoice: Partial<PaidInvoice> = {
    amount: 1000,
    payment_hash: '12345678',
    memo: 'Test',
  };

  const invoiceData: InvoiceData = {
    type: 'createUser',
    email: 'test@domain.com',
  };

  await request(webhooksExpressApp)
    .post('/v1/payments')
    .send(paidInvoice)
    .query({
      key: functions.config().webhooks.key,
      data: encodeURIComponent(JSON.stringify(invoiceData)),
    })
    .expect(204);

  const payments = await db.collection(paymentsPath).get();
  expect(payments.docs.length).toBe(1);
  const createdPayment = payments.docs[0].data() as IPayment;
  expect(createdPayment.amount).toBe(1);
  expect(createdPayment.memo).toBe('Test');
  expect(createdPayment.status).toBe('completed');
  expect(createdPayment.type).toBe(invoiceData.type);
  expect(createdPayment.email).toBe(invoiceData.email);
});
