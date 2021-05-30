import {
  DEFAULT_KEYBOARD_CONTROLS,
  getUserPath,
  IUser,
  IUserReadOnlyProperties,
  usersPath,
} from 'infinitris2-models';
import { setup, teardown, createdTimestamp } from './helpers/setup';
import './helpers/extensions';

export const userId1 = 'userId1';
export const userId2 = 'userId2';
export const userId1Path = getUserPath(userId1);

export const validUserRequest: Omit<IUser, 'readOnly'> = {
  controls: DEFAULT_KEYBOARD_CONTROLS,
  hasSeenAllSet: false,
  hasSeenWelcome: true,
  preferredInputMethod: 'keyboard',
  locale: 'EN',
};

export const existingUser: IUser = {
  ...validUserRequest,
  readOnly: {
    createdTimestamp,
    nickname: 'Bob',
    networkImpact: 0,
    credits: 3,
    email: 'bob@gmail.com',
  },
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
    const db = await setup(undefined, {
      [userId1Path]: existingUser,
    });

    await expect(db.doc(userId1Path).get()).toDeny();
  });

  test('should deny reading a user with a different ID', async () => {
    const db = await setup(
      { uid: userId2 },
      {
        [userId1Path]: existingUser,
      }
    );

    await expect(db.doc(userId1Path).get()).toDeny();
  });

  test('should deny creating a user', async () => {
    const db = await setup({ uid: userId1 });

    const otherUserPath = getUserPath(userId1);
    await expect(db.doc(otherUserPath).set(existingUser)).toDeny();
  });

  test('should allow updating a user when logged in with the matching id', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    await expect(
      db.doc(userId1Path).set(validUserRequest, { merge: true })
    ).toAllow();
  });

  test('should not allow setting properties outside allow list', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    // invalid property
    await expect(
      db.doc(userId1Path).set({
        credits: 5,
      })
    ).toDeny();
  });

  test('should not allow setting properties of incorrect type', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );

    // invalid property types
    await expect(
      db.doc(userId1Path).set({
        nickname: 5,
      })
    ).toDeny();
    await expect(
      db.doc(userId1Path).set({
        referredByAffiliateId: 5,
      })
    ).toDeny();
    await expect(
      db.doc(userId1Path).set({
        controls: 5,
      })
    ).toDeny();
    await expect(
      db.doc(userId1Path).set({
        hasSeenAllSet: 5,
      })
    ).toDeny();
    await expect(
      db.doc(userId1Path).set({
        hasSeenWelcome: 5,
      })
    ).toDeny();
    await expect(
      db.doc(userId1Path).set({
        preferredInputMethod: 5,
      })
    ).toDeny();
    await expect(
      db.doc(userId1Path).set({
        locale: 5,
      })
    ).toDeny();

    // controls: unsupported control
    await expect(
      db.doc(userId1Path).set({
        controls: {
          nonExistentControl: '1',
        },
      })
    ).toDeny();

    // controls: unsupported input method
    await expect(
      db.doc(userId1Path).set({
        controls: {
          preferredInputMethod: 'nonexistent',
        },
      })
    ).toDeny();
  });

  test('should not be able to delete user', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );
    await expect(db.doc(userId1Path).delete()).toDeny();
  });

  test('should not be able to write readonly properties', async () => {
    const db = await setup(
      { uid: userId1 },
      {
        [userId1Path]: existingUser,
      }
    );
    await expect(
      db.doc(userId1Path).set(
        {
          readOnly: {
            credits: 9999999,
          } as IUserReadOnlyProperties,
        },
        { merge: true }
      )
    ).toDeny();
  });
});
