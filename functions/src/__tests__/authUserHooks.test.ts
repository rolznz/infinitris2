import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { onCreateAuthUser } from '../onCreateAuthUser';
import {
  getAffiliatePath,
  getUserPath,
  IAffiliate,
  IUser,
} from 'infinitris2-models';
import firebase from 'firebase';

describe('Auth User Hooks', () => {
  afterEach(async () => {
    await teardown();
  });

  test('create new user', async () => {
    const { db, test } = await setup(undefined, undefined, false);

    const uid = '123453';
    const email = 'test3@email.com';
    const authUser = test.auth.makeUserRecord({
      uid,
      email,
    });

    await test.wrap(onCreateAuthUser)(authUser);

    const user = (await db.doc(getUserPath(uid)).get()).data() as IUser;
    expect(user.readOnly.coins).toBe(3);
    expect(user.readOnly.email).toBe(email);
    expect(user.readOnly.networkImpact).toBe(0);
    expect(user.readOnly.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    const affiliate = (
      await db.doc(getAffiliatePath(user.readOnly.affiliateId!)).get()
    ).data() as IAffiliate;

    expect(affiliate.readOnly?.userId).toBe(uid);
    expect(affiliate.readOnly?.numConversions).toBe(0);
    expect(affiliate.readOnly?.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );
  });
});
