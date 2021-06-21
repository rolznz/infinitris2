import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import dummyData from './helpers/dummyData';
import updateNetworkImpact from '../utils/updateNetworkImpact';
import {
  getImpactedUserNetworkImpactsPath,
  getNetworkImpactPath,
  INetworkImpact,
  IUser,
} from 'infinitris2-models';
import firebase from 'firebase';

describe('Update Network Impact', () => {
  afterEach(async () => {
    await teardown();
  });

  test('User cannot impact self', async () => {
    await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
      },
      false
    );
    await expect(
      updateNetworkImpact(dummyData.userId1, dummyData.userId1)
    ).rejects.toThrowError();
  });

  test('Basic network impact', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
      },
      false
    );
    await updateNetworkImpact(dummyData.userId1, dummyData.userId2);

    expect(
      (
        await db
          .collection(getImpactedUserNetworkImpactsPath(dummyData.userId1))
          .get()
      ).docs.length
    ).toEqual(1);

    const networkImpact = (
      await db
        .doc(getNetworkImpactPath(dummyData.userId1, dummyData.userId2))
        .get()
    ).data() as INetworkImpact;

    expect(networkImpact.toUserId).toBe(dummyData.userId1);
    expect(networkImpact.fromUserId).toBe(dummyData.userId2);
    expect(networkImpact.distance).toBe(1);
    expect(networkImpact.readOnly?.createdTimestamp?.seconds).toBeGreaterThan(
      firebase.firestore.Timestamp.now().seconds - 5
    );

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    await expect(user.readOnly.networkImpact).toEqual(1);
    await expect(user.readOnly.credits).toEqual(4);
  });

  test('Repeated network impact makes no changes', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
      },
      false
    );
    await updateNetworkImpact(dummyData.userId1, dummyData.userId2);
    await updateNetworkImpact(dummyData.userId1, dummyData.userId2);

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    await expect(user.readOnly.networkImpact).toEqual(1);
    await expect(user.readOnly.credits).toEqual(4);
  });

  test('Recursive network impact', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
        [dummyData.user2Path]: dummyData.existingUser,
      },
      false
    );
    await updateNetworkImpact(dummyData.userId1, dummyData.userId2);
    await updateNetworkImpact(dummyData.userId2, dummyData.userId3);

    const secondLevelNetworkImpact = (
      await db
        .doc(getNetworkImpactPath(dummyData.userId1, dummyData.userId3))
        .get()
    ).data() as INetworkImpact;

    expect(secondLevelNetworkImpact.toUserId).toEqual(dummyData.userId1);
    expect(secondLevelNetworkImpact.fromUserId).toEqual(dummyData.userId3);
    expect(secondLevelNetworkImpact.distance).toEqual(2);

    const user1 = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    await expect(user1.readOnly.networkImpact).toEqual(2);
    await expect(user1.readOnly.credits).toEqual(5);

    const user2 = (await db.doc(dummyData.user2Path).get()).data() as IUser;
    await expect(user2.readOnly.networkImpact).toEqual(1);
    await expect(user2.readOnly.credits).toEqual(4);
  });
});
