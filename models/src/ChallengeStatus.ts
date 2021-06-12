import ChallengeCompletionStats from './ChallengeCompletionStats';

export type ChallengeStatusCode = 'pending' | 'success' | 'failed';

export type ChallengeStatus = {
  code: ChallengeStatusCode;
  medalIndex: number; // 1 = bronze, 2 = silver, 3 = gold
  stats?: ChallengeCompletionStats;
};
