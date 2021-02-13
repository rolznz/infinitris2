import IClient from './IClient';
import { TutorialStatus } from './TutorialStatus';

export default interface ITutorialClient extends IClient {
  getStatus(): TutorialStatus;
}
