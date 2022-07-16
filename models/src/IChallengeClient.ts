import { IChallenge } from '@models/IChallenge';
import { IChallengeEditor } from '@models/IChallengeEditor';
import {
  ChallengeAttemptRecording,
  IIngameChallengeAttempt,
} from './IChallengeAttempt';

export default interface IChallengeClient {
  getChallengeAttempt(): IIngameChallengeAttempt;
  get challenge(): IChallenge;
  get editor(): IChallengeEditor | undefined;
  set recording(recording: ChallengeAttemptRecording | undefined);
  get recording(): ChallengeAttemptRecording | undefined;
}
