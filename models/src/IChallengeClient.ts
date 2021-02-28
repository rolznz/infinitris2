import IClient from './IClient';
import { ChallengeStatus } from './ChallengeStatus';

export default interface IChallengeClient extends IClient {
  getStatus(): ChallengeStatus;
}
