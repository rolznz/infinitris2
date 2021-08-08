import IClient from './IClient';
import { IIngameChallengeAttempt } from './IChallengeAttempt';

export default interface IChallengeClient extends IClient {
  getChallengeAttempt(): IIngameChallengeAttempt;
}
