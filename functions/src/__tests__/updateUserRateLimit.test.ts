import { setup } from './helpers/setup';
import './helpers/extensions';
import { IUser, Timestamp } from 'infinitris2-models';
import dummyData from './helpers/dummyData';
import {
  RATE_LIMIT_USER_CREATE_WRITE_RATE_CHANGE,
  updateUserRateLimit,
} from '../utils/updateUserRateLimit';

test('rate limit increases when user writes rapidly', async () => {
  const { db } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      [dummyData.user1Path]: dummyData.existingUser,
    },
    false
  );

  const timestamp: Timestamp = {
    seconds: dummyData.createdTimestamp.seconds + 1,
    nanoseconds: 0,
  };

  await updateUserRateLimit(dummyData.userId1, timestamp);

  const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;

  expect(user.readOnly.numWrites).toBe(1);
  expect(user.readOnly.lastWriteTimestamp).toEqual(timestamp);
  // expect rate limit to increase because time since last write < RATE_LIMIT_MAX_SECONDS
  expect(user.readOnly.writeRate).toBe(
    RATE_LIMIT_USER_CREATE_WRITE_RATE_CHANGE
  );
});

test('user rate limit decreases when user writes less often', async () => {
  const existingUser: IUser = {
    ...dummyData.existingUser,
    readOnly: {
      ...dummyData.existingUser.readOnly,
      writeRate: RATE_LIMIT_USER_CREATE_WRITE_RATE_CHANGE,
    },
  };

  const { db } = await setup(
    undefined,
    {
      [dummyData.challenge1Path]: dummyData.existingPublishedChallenge,
      [dummyData.user1Path]: existingUser,
    },
    false
  );

  const timestamp: Timestamp = {
    seconds: dummyData.createdTimestamp.seconds + 6,
    nanoseconds: 0,
  };

  await updateUserRateLimit(dummyData.userId1, timestamp);

  const user = (await db.doc(dummyData.user1Path).get()).data() as IUser;

  expect(user.readOnly.numWrites).toBe(1);
  expect(user.readOnly.lastWriteTimestamp).toEqual(timestamp);
  // expect rate limit to increase because time since last write > RATE_LIMIT_MAX_SECONDS
  expect(user.readOnly.writeRate).toBe(0);
});

// TODO: other tests e.g. min / max value
