import * as functions from 'firebase-functions';
import updateScoreboard from './schedules/updateScoreboard';
import scheduledCreditReward from './schedules/scheduledCreditReward';
import { scheduledFirestoreExport } from './schedules/scheduledFirestoreExport';
import updateFreePremiumSignups from './schedules/updateFreePremiumSignups';

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
  .schedule('every 12 hours')
  .onRun(async (_context) => {
    try {
      await updateScoreboard();
    } catch (error) {
      console.error(error);
    }
    return null;
  });

export const onUpdateFreePremiumSignupsSchedule = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (_context) => {
    try {
      await updateFreePremiumSignups();
    } catch (error) {
      console.error(error);
    }
    return null;
  });

export const onFirestoreExportSchedule = functions.pubsub
  .schedule('every 24 hours')
  .onRun((_context) => {
    return scheduledFirestoreExport();
  });
