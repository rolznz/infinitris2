import * as functions from 'firebase-functions';
import scheduledCreditReward from './utils/scheduledCreditReward';
import updateScoreboard from './utils/updateScoreboard';

export const onDailyCreditAwardSchedule = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (_context) => {
    try {
      await scheduledCreditReward();
    } catch (error) {
      console.error(error);
    }

    return null;
  });

export const onUpdateScoreboardSchedule = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (_context) => {
    try {
      await updateScoreboard();
    } catch (error) {
      console.error(error);
    }
    return null;
  });
