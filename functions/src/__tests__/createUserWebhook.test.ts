import { setup } from './helpers/setup';
import './helpers/extensions';
import { CreateUserRequest, CreateUserResponse } from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { createInvoice, CreateInvoiceResponse } from '../utils/createInvoice';
jest.mock('../utils/createInvoice');

const createInvoiceMock = createInvoice as jest.MockedFunction<
  typeof createInvoice
>;

test('create user webhook', async () => {
  await setup(undefined, {}, false);
  const createInvoiceResponse: CreateInvoiceResponse = {
    payment_request: 'lnbc20m1pvjluezpp5',
    payment_hash: '123456',
    checking_id: '11111',
  };
  createInvoiceMock.mockReturnValue(Promise.resolve(createInvoiceResponse));

  const userToCreate: CreateUserRequest = {
    email: 'test@domain.com',
  };

  const result = await request(webhooksExpressApp)
    .post('/v1/users')
    .send(userToCreate)
    .expect(201);

  const createUserResponse: CreateUserResponse = {
    invoice: createInvoiceResponse.payment_request,
    paymentId: createInvoiceResponse.payment_hash,
  };
  expect(result.body).toEqual(createUserResponse);

  // spam endpoint
  await request(webhooksExpressApp)
    .post('/v1/users')
    .send(userToCreate)
    .expect(429);
});
