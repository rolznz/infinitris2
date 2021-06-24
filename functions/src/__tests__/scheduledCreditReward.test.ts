import { setup, teardown } from './helpers/setup';
import './helpers/extensions';
import { IUser } from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import scheduledCreditReward from '../utils/scheduledCreditReward';

describe('Scheduled Credit Reward', () => {
  afterEach(async () => {
    await teardown();
  });

  test('users receive reward of 1 credit', async () => {
    const { db } = await setup(
      undefined,
      {
        [dummyData.user1Path]: dummyData.existingUser,
      },
      false
    );
    const coins = dummyData.existingUser.readOnly.coins;

    await scheduledCreditReward();

    const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;

    expect(user.readOnly.coins).toEqual(coins + 1);
  });
});
