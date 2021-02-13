import TutorialCompletionStats from './TutorialCompletionStats';

export type TutorialStatus = {
  status: 'pending' | 'success' | 'failed';
  stars: number;
  stats?: TutorialCompletionStats;
};
