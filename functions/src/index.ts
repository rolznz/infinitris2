import { onCreateAffiliate } from './onCreateAffiliate';
import { onCreateChallenge } from './onCreateChallenge';
import { onCreateRating } from './onCreateRating';
import { onCreateUser } from './onCreateUser';
import {
  onDailyCreditAwardSchedule,
  onUpdateScoreboardSchedule,
} from './schedules';

exports.onCreateChallenge = onCreateChallenge;
exports.onCreateUser = onCreateUser;
exports.onCreateRating = onCreateRating;
exports.onCreateAffiliate = onCreateAffiliate;
exports.onDailyCreditAwardSchedule = onDailyCreditAwardSchedule;
exports.onUpdateScoreboardSchedule = onUpdateScoreboardSchedule;
