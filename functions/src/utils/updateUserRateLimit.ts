import {
  getUserPath,
  IUser,
  objectToDotNotation,
  Timestamp,
} from 'infinitris2-models';
import { getDb, increment } from './firebase';

// simple rate limiter that allows up to 10 writes over 5 seconds
export const RATE_LIMIT_USER_WRITE_RATE_CHANGE = 0.1;
export const RATE_LIMIT_MAX_SECONDS = 5;

export async function updateUserRateLimit(
  userId: string | undefined,
  currentTime: Timestamp,
  extraFields?: { [key: string]: Object }
) {
  if (!userId) {
    return;
  }

  const userDocRef = getDb().doc(getUserPath(userId));
  const user = (await userDocRef.get()).data() as IUser;

  const secondsSinceLastUpdate =
    currentTime.seconds - user.readOnly.lastWriteTimestamp.seconds;
  let writeRateChange = 0;

  if (secondsSinceLastUpdate > RATE_LIMIT_MAX_SECONDS) {
    // reduce rate limiter
    if (user.readOnly.writeRate > 0) {
      writeRateChange = -RATE_LIMIT_USER_WRITE_RATE_CHANGE;
    }
  } else {
    writeRateChange = RATE_LIMIT_USER_WRITE_RATE_CHANGE;
  }

  if (user.readOnly.writeRate + writeRateChange >= 1) {
    console.warn(
      `Write rate hit for user ${userId}: ${
        user.readOnly.writeRate + writeRateChange
      }`
    );
  } /* else {
    console.log(
      `Updating write rate for user ${userId}: ${
        user.readOnly.writeRate + writeRateChange
      }`
    );
  }*/
  const updateUser = objectToDotNotation<IUser>(
    {
      readOnly: {
        lastWriteTimestamp: currentTime,
        writeRate: increment(writeRateChange),
        numWrites: increment(1),
      },
    },
    ['readOnly.lastWriteTimestamp', 'readOnly.writeRate', 'readOnly.numWrites']
  );
  await userDocRef.update({
    ...updateUser,
    ...(extraFields || {}),
  });
}
