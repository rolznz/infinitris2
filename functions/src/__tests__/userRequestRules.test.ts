import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import { IUserRequest } from '../../../models/dist';

describe('User Requests Rules', () => {
  afterEach(async () => {
    await teardown();
  });

  test('should deny creating a user request when logged out', async () => {
    const { db } = await setup(undefined, {
      [dummyData.user1Path]: dummyData.existingUser,
    });

    await expect(
      db
        .doc(dummyData.userRequest1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should deny creating a user request for another user', async () => {
    const { db } = await setup(
      { uid: dummyData.userId2 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
      }
    );

    await expect(
      db
        .doc(dummyData.userRequest1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should allow creating a user request for self', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db
        .doc(dummyData.userRequest1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toAllow();
  });

  test('should not allow creating a user request with created property set to true', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db.doc(dummyData.userRequest1Path).set({
        ...dummyData.referredByAffiliateRequest,
        created: true,
      } as IUserRequest)
    ).toDeny();
  });

  test('should deny updating a user request', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
        [dummyData.userRequest1Path]: dummyData.referredByAffiliateRequest,
      }
    );

    await expect(
      db
        .doc(dummyData.userRequest1Path)
        .set(dummyData.referredByAffiliateRequest)
    ).toDeny();
  });

  test('should deny creating an unsupported request', async () => {
    const { db } = await setup(
      { uid: dummyData.userId1 },
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.affiliate1Path]: dummyData.affiliate1,
      }
    );

    await expect(
      db.doc(dummyData.userRequest1Path).set({
        ...dummyData.referredByAffiliateRequest,
        requestType: 'unknownRequestType',
      })
    ).toDeny();
  });
});
