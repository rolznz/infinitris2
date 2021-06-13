import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { onCreateAuthUser } from '../src/onCreateAuthUser';
import { getUserPath, IUser } from 'infinitris2-models';
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

    const userSnapshot = await db.doc(getUserPath(uid)).get();
    const userData = userSnapshot.data() as IUser;
    expect(userSnapshot.exists).toBe(true);
    expect(userData.readOnly.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );
  });
});
