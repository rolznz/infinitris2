import { setup } from './helpers/setup';
import './helpers/extensions';
import {
  getLoginCodePath,
  LoginCode,
  loginCodesPath,
  LoginRequest,
} from 'infinitris2-models';
import { webhooksExpressApp } from '../webhooks';
import * as request from 'supertest';
import { createCustomAuthToken, getUserByEmail } from '../utils/firebase';
import * as firebase from 'firebase-admin';
import { firestore } from '@firebase/rules-unit-testing';
import { processCreateUser } from '../utils/processCreateUser';
jest.mock('../utils/processCreateUser');
jest.mock('../utils/sendLoginCode');

const getUserByEmailMock = getUserByEmail as jest.MockedFunction<
  typeof getUserByEmail
>;

const processCreateUserMock = processCreateUser as jest.MockedFunction<
  typeof processCreateUser
>;

const createCustomLoginTokenMock = createCustomAuthToken as jest.MockedFunction<
  typeof createCustomAuthToken
>;

test('login with no code generates code', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await setup(undefined, {}, false);

  getUserByEmailMock.mockReturnValue(
    Promise.resolve({ uid: '1234' } as firebase.auth.UserRecord)
  );

  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
  };

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(204);

  expect(result.body).toEqual({}); // not sure why it still returns a body

  // spam endpoint
  await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(429);
});

test('login retry works', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
    code: '12345',
  };

  const customToken = '9876';

  createCustomLoginTokenMock.mockReturnValue(Promise.resolve(customToken));

  const { db } = await setup(
    undefined,
    {
      [getLoginCodePath(loginRequest.email)]: {
        numAttempts: 2,
        createdDateTime: firestore.Timestamp.now(),
        code: loginRequest.code,
      } as LoginCode,
    },
    false
  );

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(201);

  expect(result.body).toEqual(customToken);
  // login code should be deleted after login
  const loginCodes = await db.collection(loginCodesPath).get();
  expect(loginCodes.docs.length).toBe(0);
});

test('login with too many attempts returns conflict', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
    code: '12345',
  };

  await setup(
    undefined,
    {
      [getLoginCodePath(loginRequest.email)]: {
        numAttempts: 3,
        createdDateTime: firestore.Timestamp.now(),
        code: loginRequest.code,
      } as LoginCode,
    },
    false
  );

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(409);

  expect(result.body).toEqual({}); // not sure why it still returns a body
});

test('login with wrong password increases attempts', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
    code: '12345',
  };

  const { db } = await setup(
    undefined,
    {
      [getLoginCodePath(loginRequest.email)]: {
        numAttempts: 0,
        createdDateTime: firestore.Timestamp.now(),
        code: loginRequest.code + '1',
      } as LoginCode,
    },
    false
  );

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(409);

  expect(result.body).toEqual({}); // not sure why it still returns a body
  const loginCodes = await db.collection(loginCodesPath).get();
  expect(loginCodes.docs.length).toBe(1);
  const loginCode = loginCodes.docs[0].data() as LoginCode;
  expect(loginCode.numAttempts).toBe(1);
});

test('try to generate new code without waiting returns too many attempts', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
  };

  await setup(
    undefined,
    {
      [getLoginCodePath(loginRequest.email)]: {
        numAttempts: 0,
        createdDateTime: firestore.Timestamp.now(),
        code: '12345',
      } as LoginCode,
    },
    false
  );

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(429);

  expect(result.body).toEqual({}); // not sure why it still returns a body
});

test('login with no user generates user if allowUserCreation is true', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
    code: '12345',
  };

  const { db } = await setup(
    undefined,
    {
      [getLoginCodePath(loginRequest.email)]: {
        numAttempts: 0,
        createdDateTime: firestore.Timestamp.now(),
        code: loginRequest.code,
        allowUserCreation: true,
      } as LoginCode,
    },
    false
  );

  const customToken = '9876';
  createCustomLoginTokenMock.mockReturnValue(Promise.resolve(customToken));

  getUserByEmailMock.mockReturnValue(Promise.resolve(null));
  processCreateUserMock.mockReturnValue(
    Promise.resolve({ uid: '1234' } as firebase.auth.UserRecord)
  );

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(201);

  expect(result.body).toEqual(customToken);
  // login code should be deleted after login
  const loginCodes = await db.collection(loginCodesPath).get();
  expect(loginCodes.docs.length).toBe(0);
});

test('login with no user fails if allowUserCreation is false', async () => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const loginRequest: LoginRequest = {
    email: 'test@domain.com',
    code: '12345',
  };

  await setup(
    undefined,
    {
      [getLoginCodePath(loginRequest.email)]: {
        numAttempts: 2,
        createdDateTime: firestore.Timestamp.now(),
        code: loginRequest.code,
        allowUserCreation: false,
      } as LoginCode,
    },
    false
  );

  createCustomLoginTokenMock.mockRestore();

  getUserByEmailMock.mockReturnValue(Promise.resolve(null));
  processCreateUserMock.mockImplementation(() => {
    throw new Error('This should not happen');
  });

  const result = await request(webhooksExpressApp)
    .post('/v1/login')
    .send(loginRequest)
    .expect(404);

  expect(result.body).toEqual({});
});
