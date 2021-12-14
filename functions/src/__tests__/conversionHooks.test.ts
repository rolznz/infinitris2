import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import {
  getConversionPath,
  IAffiliate,
  IConversion,
  IUser,
} from 'infinitris2-models';
import { onCreateConversion } from '../onCreateConversion';
import dummyData from './helpers/dummyData';
import { firestore } from '@firebase/rules-unit-testing';

describe('Conversion Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create conversion', async () => {
    const user2: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        affiliateId: dummyData.affiliateId1,
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.user2Path]: user2,
        [dummyData.conversion1Path]: dummyData.conversion1,
      },
      false
    );

    await test.wrap(onCreateConversion)(
      test.firestore.makeDocumentSnapshot(
        dummyData.conversion1,
        dummyData.conversion1Path
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }), // user 1 was referred by user 2
        params: {
          affiliateId: dummyData.affiliateId1,
          convertedUserId: dummyData.userId1,
        },
      }
    );

    const affiliate = (
      await db.doc(dummyData.affiliate1Path).get()
    ).data() as IAffiliate;

    expect(affiliate.readOnly.numConversions).toBe(1);

    const convertedUser = (
      await db.doc(dummyData.user1Path).get()
    ).data() as IUser;
    expect(convertedUser.readOnly.networkImpact).toEqual(0);
    // make sure the user now has a referredByAffiliateId so that they cannot be referred again
    expect(convertedUser.readOnly.referredByAffiliateId).toEqual(
      dummyData.affiliateId1
    );
    // +3 bonus coins for using affiliate link
    expect(convertedUser.readOnly.coins).toEqual(6);

    const affiliateUser = (
      await db.doc(dummyData.user2Path).get()
    ).data() as IUser;
    // network impact user 1 => user 2 after conversion
    expect(affiliateUser.readOnly.networkImpact).toEqual(1);
    // 3 initial coins + 1 for increased network impact
    expect(affiliateUser.readOnly.coins).toEqual(4);

    const conversion = (
      await db
        .doc(getConversionPath(dummyData.affiliateId1, dummyData.userId1))
        .get()
    ).data() as IConversion;

    expect(conversion.readOnly!.createdTimestamp?.seconds).toBeGreaterThan(
      firestore.Timestamp.now().seconds - 5
    );
  });
});
