import { IChallenge } from '@models/IChallenge';
import { IChallengeEditor } from '@models/IChallengeEditor';
import { IIngameChallengeAttempt } from './IChallengeAttempt';

export default interface IChallengeClient {
  getChallengeAttempt(): IIngameChallengeAttempt;
  get challenge(): IChallenge;
  get editor(): IChallengeEditor | undefined;
}
