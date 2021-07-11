import { affiliatesPath, IAffiliate } from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

const existingAffiliate: IAffiliate = {
  readOnly: {
    userId: dummyData.userId1,
    numConversions: 0,
    createdTimestamp: dummyData.createdTimestamp,
    lastModifiedTimestamp: dummyData.lastModifiedTimestamp,
    numTimesModified: 0,
  },
  created: true,
};

describe('Affiliate Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should not allow reading the affiliates collection', async () => {
    const { db } = await setup();

    await expect(db.collection(affiliatesPath).get()).toDeny();
  });

  test('should allow reading an affiliate when logged out', async () => {
    const { db } = await setup();

    await expect(db.doc(dummyData.affiliate1Path).get()).toDeny();
  });

  test('should allow reading own affiliate', async () => {
    const { db } = await setup(
      {
        uid: dummyData.userId1,
      },
      {
        [dummyData.affiliate1Path]: existingAffiliate,
      }
    );

    await expect(db.doc(dummyData.affiliate1Path).get()).toAllow();
  });

  test('should not allow reading other affiliate', async () => {
    const { db } = await setup(
      {
        uid: dummyData.userId2,
      },
      {
        [dummyData.affiliate1Path]: existingAffiliate,
      }
    );

    await expect(db.doc(dummyData.affiliate1Path).get()).toDeny();
  });

  test('should not allow creating an affiliate', async () => {
    const { db } = await setup({
      uid: dummyData.userId1,
    });

    const affiliate: IAffiliate = {
      readOnly: {
        numConversions: 9999,
        userId: dummyData.userId1,
        createdTimestamp: dummyData.createdTimestamp,
        lastModifiedTimestamp: dummyData.lastModifiedTimestamp,
        numTimesModified: 0,
      },
      created: true,
    };

    await expect(db.doc(dummyData.affiliate1Path).set(affiliate)).toDeny();
  });

  test('should not allow updating affiliate', async () => {
    const { db } = await setup(
      {
        uid: dummyData.userId1,
      },
      {
        [dummyData.affiliate1Path]: existingAffiliate,
      }
    );

    const affiliate: IAffiliate = {
      readOnly: {
        numConversions: 9999,
        userId: dummyData.userId1,
        createdTimestamp: dummyData.createdTimestamp,
        lastModifiedTimestamp: dummyData.lastModifiedTimestamp,
        numTimesModified: 0,
      },
      created: true,
    };

    await expect(db.doc(dummyData.affiliate1Path).update(affiliate)).toDeny();
  });

  test('should not allow deleting an affiliate', async () => {
    const { db } = await setup(
      {
        uid: dummyData.userId1,
      },
      {
        [dummyData.affiliate1Path]: existingAffiliate,
      }
    );

    await expect(db.doc(dummyData.affiliate1Path).delete()).toDeny();
  });
});
