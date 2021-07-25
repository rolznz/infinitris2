import ControlSettings from './ControlSettings';
import InputMethod from './InputMethod';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IUserReadOnlyProperties extends IEntityReadOnlyProperties {
  readonly coins: number;
  readonly networkImpact: number;
  readonly nickname?: string;
  readonly colorId?: string;
  readonly email: string;

  readonly affiliateId?: string;
  readonly referredByAffiliateId?: string;
  // readonly patternId?: string;
  // readonly
  readonly purchasedEntityIds: string[];
}

export default interface IUser extends IEntity {
  readonly readOnly: IUserReadOnlyProperties;
  readonly hasSeenWelcome?: boolean;
  readonly hasSeenAllSet?: boolean;
  readonly locale?: string;
  readonly preferredInputMethod?: InputMethod;
  readonly controls?: ControlSettings;
}
