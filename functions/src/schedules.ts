import * as functions from 'firebase-functions';
import scheduledCreditReward from './utils/scheduledCreditReward';
import updateScoreboard from './utils/updateScoreboard';

export const onDailyCreditAwardSchedule = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (_context) => {
    await scheduledCreditReward();

    return null;
  });

export const onUpdateScoreboardSchedule = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (_context) => {
    await updateScoreboard();

    return null;
  });
