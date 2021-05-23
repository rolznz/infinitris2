import {
  DEFAULT_KEYBOARD_CONTROLS,
  getUserPath,
  IUser,
  usersPath,
} from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';

const userId1 = 'userId1';
const userId2 = 'userId2';

const validUserObject: Partial<IUser> = {
  nickname: 'Bob',
  email: 'bob@gmail.com',
  referredByAffiliateId: '1234',
  controls: DEFAULT_KEYBOARD_CONTROLS,
  hasSeenAllSet: false,
  hasSeenWelcome: true,
  preferredInputMethod: 'keyboard',
  locale: 'EN',
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
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId1 },
      {
        [thisUserPath]: validUserObject,
      }
    );

    // ensure can set a valid property to validate below tests are working as expected
    await expect(
      db.doc(thisUserPath).set(
        {
          email: 'valid@email.com',
        },
        { merge: true }
      )
    ).toAllow();

    // invalid property
    await expect(
      db.doc(thisUserPath).set({
        credits: 5,
      })
    ).toDeny();
  });

  test('should not allow setting properties of incorrect type', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId1 },
      {
        [thisUserPath]: validUserObject,
      }
    );

    // ensure can set a valid property to validate below tests are working as expected
    await expect(
      db.doc(thisUserPath).set(
        {
          email: 'valid@email.com',
        },
        { merge: true }
      )
    ).toAllow();

    // invalid property types
    await expect(
      db.doc(thisUserPath).set({
        nickname: 5,
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        referredByAffiliateId: 5,
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        controls: 5,
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        hasSeenAllSet: 5,
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        hasSeenWelcome: 5,
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        preferredInputMethod: 5,
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        locale: 5,
      })
    ).toDeny();

    // controls: unsupported control
    await expect(
      db.doc(thisUserPath).set({
        controls: {
          nonExistentControl: '1',
        },
      })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({
        controls: {
          preferredInputMethod: 'nonexistent',
        },
      })
    ).toDeny();
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

  test('should not be able to remove required properties', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId1 },
      {
        [thisUserPath]: validUserObject,
      }
    );
    await expect(db.doc(thisUserPath).set({})).toDeny();
    await expect(
      db.doc(thisUserPath).set(
        {
          email: '',
        },
        { merge: true }
      )
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set(
        {
          nickname: '',
        },
        { merge: true }
      )
    ).toDeny();

    await expect(db.doc(thisUserPath).set({}, { merge: true })).toAllow();
  });

  test('properties should meet requirements', async () => {
    const thisUserPath = getUserPath(userId1);
    const db = await setup(
      { uid: userId1 },
      {
        [thisUserPath]: validUserObject,
      }
    );
    await expect(
      db.doc(thisUserPath).set({ email: 'a'.repeat(361) }, { merge: true })
    ).toDeny();
    await expect(
      db.doc(thisUserPath).set({ email: 'aa' }, { merge: true })
    ).toDeny(); // invalid email format
    await expect(
      db.doc(thisUserPath).set({ nickname: 'a' }, { merge: true })
    ).toDeny(); // must be at least 2 chars
    await expect(
      db.doc(thisUserPath).set({ nickname: '**' }, { merge: true })
    ).toDeny(); // invalid chars not allowed
    await expect(
      db.doc(thisUserPath).set({ nickname: 'a'.repeat(16) }, { merge: true })
    ).toDeny();
  });
});
