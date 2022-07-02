import * as functions from 'firebase-functions';
import updateScoreboard from './utils/updateScoreboard';
import scheduledCreditReward from './utils/scheduledCreditReward';
import { scheduledFirestoreExport } from './schedules/scheduledFirestoreExport';

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

export const onScheduledFirestoreExport = functions.pubsub
  .schedule('every 24 hours')
  .onRun((_context) => {
    return scheduledFirestoreExport();
  });
