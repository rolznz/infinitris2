import IClient from './IClient';
import TutorialCompletionStats from './TutorialCompletionStats';

export type TutorialStatus = {
  status: 'pending' | 'success' | 'failed';
  stars: number;
  stats?: TutorialCompletionStats;
  // TODO: store time taken, number of moves, line clears, etc.
};

export default interface ITutorialClient extends IClient {
  getStatus(): TutorialStatus;
}
