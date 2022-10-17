import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IUser } from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import scheduledCreditReward from '../schedules/scheduledCreditReward';

describe('Scheduled Credit Reward', () => {
  afterEach(async () => {
    await teardown();
  });

  test('users top up to 3 credits', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.user1Path]: {
          ...dummyData.existingUser,
          readOnly: {
            ...dummyData.existingUser.readOnly,
            coins: 2,
          },
        } as IUser,
        [dummyData.user2Path]: {
          ...dummyData.existingUser,
          readOnly: {
            ...dummyData.existingUser.readOnly,
            coins: 4,
          },
        } as IUser,
      },
      false
    );

    await scheduledCreditReward();
    const user1 = (await db.doc(dummyData.user1Path).get()).data() as IUser;
    const user2 = (await db.doc(dummyData.user2Path).get()).data() as IUser;

    expect(user1.readOnly.coins).toEqual(3);
    expect(user2.readOnly.coins).toEqual(4); // unchanged
  });
});
