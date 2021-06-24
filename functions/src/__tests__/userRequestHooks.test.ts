import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import {
  getConversionPath,
  IAffiliate,
  IConversion,
  IUser,
} from 'infinitris2-models';
import { onCreateUserRequest } from '../onCreateUserRequest';
import dummyData from './helpers/dummyData';
import firebase from 'firebase';

describe('User Request Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('conversion created by requesting to set referred by affiliate ID', async () => {
    const existingAffiliateUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        affiliateId: dummyData.affiliateId1,
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.user2Path]: existingAffiliateUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.referredByAffiliateRequestPath]:
          dummyData.referredByAffiliateRequest,
      },
      false
    );

    await test.wrap(onCreateUserRequest)(
      test.firestore.makeDocumentSnapshot(
        dummyData.referredByAffiliateRequest,
        dummyData.referredByAffiliateRequestPath
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }), // user 1 was referred by user 2
      }
    );

    const affiliate = (
      await db.doc(dummyData.affiliate1Path).get()
    ).data() as IAffiliate;

    expect(affiliate.readOnly.numConversions).toBe(1);

    const affiliateUser = (
      await db.doc(dummyData.user2Path).get()
    ).data() as IUser;
    // network impact user 1 => user 2 after conversion
    expect(affiliateUser.readOnly.networkImpact).toEqual(1);
    // 3 initial credits + 1 network impact, + 2 bonus conversion credits
    expect(affiliateUser.readOnly.credits).toEqual(6);

    const convertedUser = (
      await db.doc(dummyData.user1Path).get()
    ).data() as IUser;
    expect(convertedUser.readOnly.networkImpact).toEqual(0);
    // +3 bonus credits for using affiliate link
    expect(convertedUser.readOnly.credits).toEqual(6);

    const conversion = (
      await db
        .doc(getConversionPath(dummyData.affiliateId1, dummyData.userId1))
        .get()
    ).data() as IConversion;
    expect(conversion.readOnly.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    // request should be deleted afterward
    expect(
      (await db.doc(dummyData.referredByAffiliateRequestPath).get()).exists
    ).toBe(false);
  });

  test('conversions provide increasing revenue', async () => {
    const existingAffiliateUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        affiliateId: dummyData.affiliateId1,
      },
    };

    const numConversions = 5;

    const existingAffiliate: IAffiliate = {
      ...dummyData.affiliate1,
      readOnly: {
        ...dummyData.affiliate1.readOnly,
        numConversions,
      },
    };

    const { db, test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.user2Path]: existingAffiliateUser,
        [dummyData.affiliate1Path]: existingAffiliate,
        [dummyData.referredByAffiliateRequestPath]:
          dummyData.referredByAffiliateRequest,
      },
      false
    );

    await test.wrap(onCreateUserRequest)(
      test.firestore.makeDocumentSnapshot(
        dummyData.referredByAffiliateRequest,
        dummyData.referredByAffiliateRequestPath
      ),
      {
        auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }), // user 1 was referred by user 2
      }
    );

    const affiliate = (
      await db.doc(dummyData.affiliate1Path).get()
    ).data() as IAffiliate;

    expect(affiliate.readOnly.numConversions).toBe(numConversions + 1);

    const affiliateUser = (
      await db.doc(dummyData.user2Path).get()
    ).data() as IUser;
    // network impact user 1 => user 2 after conversion
    expect(affiliateUser.readOnly.networkImpact).toEqual(1);
    // 3 initial credits + 1 network impact, + (2 + numConversions) bonus conversion credits
    expect(affiliateUser.readOnly.credits).toEqual(3 + 1 + 2 + numConversions);
  });

  test('cannot convert same user twice', async () => {
    const existingAffiliateUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        affiliateId: dummyData.affiliateId1,
      },
    };

    const existingConvertedUser: IUser = {
      ...dummyData.existingUser,
      readOnly: {
        ...dummyData.existingUser.readOnly,
        referredByAffiliateId: dummyData.affiliateId1,
      },
    };

    const { test } = await setup(
      undefined,
      {
        [dummyData.user1Path]: existingConvertedUser,
        [dummyData.user2Path]: existingAffiliateUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.referredByAffiliateRequestPath]:
          dummyData.referredByAffiliateRequest,
      },
      false
    );

    await expect(
      test.wrap(onCreateUserRequest)(
        test.firestore.makeDocumentSnapshot(
          dummyData.referredByAffiliateRequest,
          dummyData.referredByAffiliateRequestPath
        ),
        {
          auth: test.auth.makeUserRecord({ uid: dummyData.userId1 }), // user 1 was referred by user 2
        }
      )
    ).rejects.toThrowError(
      'Referred by affiliate ID already set for user ' + dummyData.userId1
    );
  });
});
