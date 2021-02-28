import ControlSettings from './ControlSettings';
import InputMethod from './InputMethod';
import { ChallengeStatus } from './ChallengeStatus';

export default interface IUser {
  readonly challengeAttempts: { [challengeId: string]: ChallengeStatus[] };
  readonly hasSeenWelcome: boolean;
  readonly nickname: string;
  readonly locale: string;
  readonly preferredInputMethod?: InputMethod;
  readonly completedChallengeIds: string[];
  readonly controls: ControlSettings;
}
