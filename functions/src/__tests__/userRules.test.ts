import {
  getUserPath,
  IEntity,
  IUserReadOnlyProperties,
  usersPath,
} from 'infinitris2-models';
import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';

describe('Users Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should deny reading the users collection', async () => {
    const { db } = await setup();

    await expect(db.collection(usersPath).get()).toDeny();
  });

  test('should deny reading a user when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
    });

    await expect(db.doc(dummyData.user1Path).get()).toDeny();
  });

  test('should deny reading a user with a different ID', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(db.doc(dummyData.user1Path).get()).toDeny();
  });

  test('should deny creating a user', async () => {
    const { db } = await setup({ uid: dummyData.userId1 });

    const otherUserPath = getUserPath(dummyData.userId1);
    await expect(db.doc(otherUserPath).set(dummyData.existingUser)).toDeny();
  });

  test('should allow updating a user when logged in with the matching id', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.user1Path).update(dummyData.updatableUser)
    ).toAllow();
  });

  test('should deny updating created property', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db.doc(dummyData.user1Path).update({
        created: false,
      } as IEntity)
    ).toDeny();
  });

  test('should not allow setting properties outside allow list', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    // invalid property
    await expect(
      db.doc(dummyData.user1Path).update({
        coins: 5,
      })
    ).toDeny();
  });

  test('should not allow setting properties of incorrect type', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    // invalid property types
    await expect(
      db.doc(dummyData.user1Path).update({
        nickname: 5,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.user1Path).update({
        referredByAffiliateId: 5,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.user1Path).update({
        controls: 5,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.user1Path).update({
        hasSeenAllSet: 5,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.user1Path).update({
        hasSeenWelcome: 5,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.user1Path).update({
        preferredInputMethod: 5,
      })
    ).toDeny();
    await expect(
      db.doc(dummyData.user1Path).update({
        locale: 5,
      })
    ).toDeny();

    // controls: unsupported control
    await expect(
      db.doc(dummyData.user1Path).update({
        controls: {
          nonExistentControl: '1',
        },
      })
    ).toDeny();

    // controls: unsupported input method
    await expect(
      db.doc(dummyData.user1Path).update({
        controls: {
          preferredInputMethod: 'nonexistent',
        },
      })
    ).toDeny();
  });

  test('should not be able to delete user', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );
    await expect(db.doc(dummyData.user1Path).delete()).toDeny();
  });

  test('should not be able to update user with readonly properties', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );
    await expect(
      db.doc(dummyData.user1Path).update({
        readOnly: {
          coins: 9999999,
        } as IUserReadOnlyProperties,
      })
    ).toDeny();
  });
});
