import ChallengeCompletionStats from './ChallengeCompletionStats';

export type ChallengeStatus = {
  status: 'pending' | 'success' | 'failed';
  stars: number;
  stats?: ChallengeCompletionStats;
};
