import { setup } from './helpers/setup';
import './helpers/extensions';
import {
  CreateUserRequest,
  CreateUserResponse,
  getSettingPath,
  PremiumSettings,
} from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { createInvoice, CreateInvoiceResponse } from '../utils/createInvoice';
jest.mock('../utils/createInvoice');

const createInvoiceMock = createInvoice as jest.MockedFunction<
  typeof createInvoice
>;

test('create user webhook (payment)', async () => {
  await setup(
    undefined,
    {
      [getSettingPath('premium')]: {
        freeAccountsRemaining: 0,
      } as PremiumSettings,
    },
    false
  );
  const createInvoiceResponse: CreateInvoiceResponse = {
    payment_request: 'lnbc20m1pvjluezpp5',
    payment_hash: '123456',
    // checking_id: '11111',
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
    isFreeSignup: false,
  };
  expect(result.body).toEqual(createUserResponse);

  // spam endpoint
  await request(webhooksExpressApp)
    .post('/v1/users')
    .send(userToCreate)
    .expect(429);
});

test('create user webhook (free premium)', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { db } = await setup(
    undefined,
    {
      [getSettingPath('premium')]: {
        freeAccountsRemaining: 1,
      } as PremiumSettings,
    },
    false
  );
  createInvoiceMock.mockImplementationOnce(() => {
    throw new Error('Should not be called');
  });

  const userToCreate: CreateUserRequest = {
    email: 'test@domain.com',
  };

  const result = await request(webhooksExpressApp)
    .post('/v1/users')
    .send(userToCreate)
    .expect(201);

  const createUserResponse: CreateUserResponse = {
    isFreeSignup: true,
  };
  expect(result.body).toEqual(createUserResponse);
  const premiumSettings = (
    await db.doc(getSettingPath('premium')).get()
  ).data() as PremiumSettings;
  expect(premiumSettings.freeAccountsRemaining).toBe(0);
});
