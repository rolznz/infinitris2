import ChallengeCompletionStats from './ChallengeCompletionStats';

export type ChallengeStatus = {
  code: 'pending' | 'success' | 'failed';
  medalIndex: number; // 1 = bronze, 2 = silver, 3 = gold
  stats?: ChallengeCompletionStats;
};
