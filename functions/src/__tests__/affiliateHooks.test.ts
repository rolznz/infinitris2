import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IAffiliate } from 'infinitris2-models';
import firebase from 'firebase';
import dummyData from './helpers/dummyData';
import { onCreateAffiliate } from '../onCreateAffiliate';

describe('Affiliate Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create affiliate', async () => {
    const affiliateRequest: IAffiliate = {};

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: affiliateRequest,
      },
      false
    );

    await test.wrap(onCreateAffiliate)(
      test.firestore.makeDocumentSnapshot(
        affiliateRequest,
        dummyData.affiliate1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }),
      }
    );

    const affiliate = (
      await db.doc(dummyData.affiliate1Path).get()
    ).data() as IAffiliate;

    expect(affiliate.readOnly?.userId).toBe(dummyData.userId1);
    expect(affiliate.readOnly?.referralCount).toBe(0);
    expect(affiliate.readOnly?.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );
  });
});
