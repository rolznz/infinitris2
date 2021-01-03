import IClient from './IClient';

export type TutorialStatus = {
  status: 'pending' | 'success' | 'failed';
  stars: number;
  // TODO: store time taken, number of moves, line clears, etc.
};

export default interface ITutorialClient extends IClient {
  getStatus(): TutorialStatus;
}
