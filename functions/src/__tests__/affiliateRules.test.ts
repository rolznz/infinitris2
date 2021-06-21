import {
  affiliatesPath,
  getAffiliatePath,
  IAffiliate,
  IUser,
} from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

const existingAffiliate: IAffiliate = {
  readOnly: {
    userId: dummyData.userId1,
    referralCount: 0,
  },
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
        referralCount: 9999,
        userId: dummyData.userId1,
      },
    };

    await expect(
      db.doc(dummyData.affiliate1Path).set(affiliate, { merge: true })
    ).toDeny();
  });

  test('should allow creating an affiliate when none exists', async () => {
    const { db } = await setup(
      {
        uid: dummyData.userId1,
      },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(db.doc(dummyData.affiliate1Path).set({})).toAllow();
  });

  test('should not allow creating a second affiliate', async () => {
    const userWithAffiliate: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        affiliateId: dummyData.affiliateId1,
      },
    };
    const { db } = await setup(
      {
        uid: dummyData.userId1,
      },
      {
        [dummyData.affiliate1Path]: existingAffiliate,
        [dummyData.user1Path]: userWithAffiliate,
      }
    );

    const affiliateId2 = 'affiliateId2';
    const affiliate2Path = getAffiliatePath(affiliateId2);

    await expect(db.doc(affiliate2Path).set({})).toDeny();
  });
});
