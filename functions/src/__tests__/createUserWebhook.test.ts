import { setup } from './helpers/setup';
import './helpers/extensions';
import { CreateUserRequest } from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { createInvoice } from '../utils/createInvoice';
jest.mock('../utils/createInvoice');

const createInvoiceMock = createInvoice as jest.MockedFunction<
  typeof createInvoice
>;

test('create user webhook', async () => {
  await setup(undefined, {}, false);
  const invoice = 'testinvoice';
  createInvoiceMock.mockReturnValue(Promise.resolve(invoice));

  const userToCreate: CreateUserRequest = {
    email: 'test@domain.com',
  };

  const result = await request(webhooksExpressApp)
    .post('/v1/users')
    .send(userToCreate)
    .expect(201);

  expect(result.body).toEqual({ invoice });

  // spam endpoint
  await request(webhooksExpressApp)
    .post('/v1/users')
    .send(userToCreate)
    .expect(429);
});
