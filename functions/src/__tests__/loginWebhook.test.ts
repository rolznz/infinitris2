import { setup } from './helpers/setup';
import './helpers/extensions';
import { LoginRequest } from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { createFirebaseUser } from '../utils/firebase';
//import { createInvoice, CreateInvoiceResponse } from '../utils/createInvoice';
//jest.mock('../utils/createInvoice');

/*const createInvoiceMock = createInvoice as jest.MockedFunction<
  typeof createInvoice
>;*/

test('login with no code generates code', async () => {
  await setup(undefined, {}, false);
  /*const createInvoiceResponse: CreateInvoiceResponse = {
    payment_request: 'lnbc20m1pvjluezpp5',
    payment_hash: '123456',
    checking_id: '11111',
  };
  //createInvoiceMock.mockReturnValue(Promise.resolve(createInvoiceResponse));*/

  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
  };

  await createFirebaseUser(loginRequest.email);

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(204);

  expect(result.body).toBeFalsy();

  // spam endpoint
  await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(429);

  await new Promise((resolve) => setTimeout(resolve, 1000));
});
