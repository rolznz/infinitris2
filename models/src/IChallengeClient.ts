import IClient from './IClient';
import { IChallengeAttempt } from './IChallengeAttempt';

export default interface IChallengeClient extends IClient {
  getChallengeAttempt(): IChallengeAttempt;
}
