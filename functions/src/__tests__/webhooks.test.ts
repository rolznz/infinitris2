import * as functions from 'firebase-functions';
import { setup } from './helpers/setup';
import './helpers/extensions';
import { Donation, donationsPath } from 'infinitris2-models';
import { LNURLpRequest, webhooksExpressApp } from '..';
import * as request from 'supertest';
import { getCurrentTimestamp } from '../utils/firebase';

test('donation webhook', async () => {
  const { db } = await setup(undefined, {}, false);

  functions.config().webhooks = {
    key: 'abc',
  };

  const donationToCreate: Partial<LNURLpRequest> = {
    amount: 1000,
    comment: 'test',
  };

  await request(webhooksExpressApp)
    .post('/v1/donations')
    .send(donationToCreate)
    .query({
      key: functions.config().webhooks.key,
    })
    .expect(204);

  const donations = await db.collection(donationsPath).get();
  expect(donations.docs.length).toBe(1);
  const createdDonation = donations.docs[0].data() as Donation;
  expect(createdDonation.amount).toBe(1);
  expect(createdDonation.comment).toBe('test');
  expect(createdDonation.createdTimestamp.seconds).toBeGreaterThan(
    getCurrentTimestamp().seconds - 5
  );
});

test('donation webhook with invalid key returns unauthorized', async () => {
  const { db } = await setup(undefined, {}, false);
  functions.config().webhooks = {
    key: 'abc',
  };

  const donationToCreate: Partial<LNURLpRequest> = {
    amount: 1000,
    comment: 'test',
  };

  await request(webhooksExpressApp)
    .post('/v1/donations')
    .send(donationToCreate)
    .expect(401);

  const donations = await db.collection(donationsPath).get();
  expect(donations.docs.length).toBe(0);
});
