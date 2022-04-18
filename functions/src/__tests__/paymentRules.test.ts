import { getPaymentPath, IPayment, paymentsPath } from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';

const paymentId1 = 'paymentId1';

const validPayment: Partial<IPayment> = {
  memo: 'Test payment',
};

describe('Payments Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should deny reading the payments collection', async () => {
    const { db } = await setup();

    await expect(db.collection(paymentsPath).get()).toDeny();
  });

  test('should allow reading a payment by ID', async () => {
    const { db } = await setup();

    await expect(db.doc(getPaymentPath(paymentId1)).get()).toAllow();
  });

  test('should deny creating a payment', async () => {
    const { db } = await setup();

    await expect(db.doc(getPaymentPath(paymentId1)).set(validPayment)).toDeny();
  });
});
