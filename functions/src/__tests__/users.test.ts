import { getUserPath, IUser, usersPath } from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';

const userId1 = 'userId1';
const userId2 = 'userId2';

const validUserObject: Partial<IUser> = {
  nickname: 'Bob',
  email: 'bob@gmail.com',
};

describe('Users Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should deny reading the users collection', async () => {
    const db = await setup();

    await expect(db.collection(usersPath).get()).toDeny();
  });

  test('should deny reading a user when logged out', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(undefined, {
      [thisUserPath]: validUserObject,
    });

    await expect(db.doc(thisUserPath).get()).toDeny();
  });

  test('should deny reading a user with a different ID', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId2 },
      {
        [thisUserPath]: validUserObject,
      }
    );

    await expect(db.doc(thisUserPath).get()).toDeny();
  });

  test('should deny creating a user when logged out', async () => {
    const db = await setup();

    const otherUserPath = getUserPath(userId1);
    await expect(db.doc(otherUserPath).set(validUserObject)).toDeny();
  });

  test('should deny creating a user when logged in with a different id', async () => {
    const db = await setup({ uid: userId2 });

    const otherUserPath = getUserPath(userId1);
    await expect(db.doc(otherUserPath).set(validUserObject)).toDeny();
  });

  test('should allow creating a user when logged in with the matching id', async () => {
    const db = await setup({ uid: userId1 });

    const thisUserPath = getUserPath(userId1);
    await expect(db.doc(thisUserPath).set(validUserObject)).toAllow();
  });

  test('should allow updating a user when logged in with the matching id', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId1 },
      {
        [thisUserPath]: validUserObject,
      }
    );

    await expect(db.doc(thisUserPath).set(validUserObject)).toAllow();
  });

  test('should not allow setting properties outside allow list', async () => {
    const db = await setup({ uid: userId1 });

    const thisUserPath = getUserPath(userId1);

    // invalid
    await expect(
      db.doc(thisUserPath).set({
        credits: 5,
      })
    ).toDeny();

    // valid
    await expect(
      db.doc(thisUserPath).set({
        email: 'valid@email.com',
      })
    ).toAllow();
  });

  test('should not be able to delete user', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId1 },
      {
        [thisUserPath]: validUserObject,
      }
    );
    await expect(db.doc(thisUserPath).delete()).toDeny();
  });
});
