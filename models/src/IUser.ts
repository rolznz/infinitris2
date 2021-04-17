import ControlSettings from './ControlSettings';
import InputMethod from './InputMethod';
import { ChallengeStatus } from './ChallengeStatus';
import IEntity from './IEntity';

export default interface IUser extends IEntity {
  readonly challengeAttempts: { [challengeId: string]: ChallengeStatus[] };
  readonly hasSeenWelcome: boolean;
  readonly hasSeenAllSet: boolean;
  readonly nickname: string;
  readonly locale: string;
  readonly preferredInputMethod?: InputMethod;
  readonly completedChallengeIds: string[];
  readonly controls: ControlSettings;
  readonly credits: number;
  readonly networkImpact: number;
}
