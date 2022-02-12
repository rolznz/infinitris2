import { IIngameChallengeAttempt } from './IChallengeAttempt';

export default interface IChallengeClient {
  getChallengeAttempt(): IIngameChallengeAttempt;
}
