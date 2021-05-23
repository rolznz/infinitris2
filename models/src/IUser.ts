import ControlSettings from './ControlSettings';
import InputMethod from './InputMethod';
import { ChallengeStatus } from './ChallengeStatus';
import IEntity from './IEntity';

export default interface IUser extends IEntity {
  readonly hasSeenWelcome: boolean;
  readonly hasSeenAllSet: boolean;
  readonly nickname: string;
  readonly email: string;
  readonly locale: string;
  readonly preferredInputMethod?: InputMethod;
  //readonly challengeAttempts: { [challengeId: string]: ChallengeStatus[] };
  //readonly completedChallengeIds: string[];
  readonly controls: ControlSettings;
  readonly credits: number;
  readonly networkImpact: number;
  readonly affiliateId?: string;
  readonly referredByAffiliateId?: string;
  readonly colorId: string;
}
