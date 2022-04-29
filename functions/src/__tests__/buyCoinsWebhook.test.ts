import { setup } from './helpers/setup';
import './helpers/extensions';
import { BuyCoinsRequest, BuyCoinsResponse } from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { createInvoice, CreateInvoiceResponse } from '../utils/createInvoice';
import dummyData from './helpers/dummyData';
jest.mock('../utils/createInvoice');

const createInvoiceMock = createInvoice as jest.MockedFunction<
  typeof createInvoice
>;

test('buy coins webhook', async () => {
  await setup(undefined, {}, false);
  const createInvoiceResponse: CreateInvoiceResponse = {
    payment_request: 'lnbc20m1pvjluezpp5',
    payment_hash: '123456',
    // checking_id: '11111',
  };
  createInvoiceMock.mockReturnValue(Promise.resolve(createInvoiceResponse));

  const buyCoinsRequest: BuyCoinsRequest = {
    email: 'test@domain.com',
    amount: 50,
    userId: dummyData.userId1,
  };

  const result = await request(webhooksExpressApp)
    .post('/v1/coins')
    .send(buyCoinsRequest)
    .expect(201);

  const buyCoinsResponse: BuyCoinsResponse = {
    invoice: createInvoiceResponse.payment_request,
    paymentId: createInvoiceResponse.payment_hash,
  };
  expect(result.body).toEqual(buyCoinsResponse);

  // spam endpoint
  await request(webhooksExpressApp)
    .post('/v1/coins')
    .send(buyCoinsRequest)
    .expect(429);
});
