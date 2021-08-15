import ControlSettings from './ControlSettings';
import InputMethod from './InputMethod';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';
import Timestamp from './Timestamp';

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
  readonly lastWriteTimestamp: Timestamp;
  readonly numWrites: number;
  readonly writeRate: number;
}

export type AppTheme = 'light' | 'dark' | 'default';

export default interface IUser extends IEntity {
  readonly readOnly: IUserReadOnlyProperties;
  readonly hasSeenWelcome?: boolean;
  readonly hasSeenAllSet?: boolean;
  readonly locale?: string;
  readonly preferredInputMethod?: InputMethod;
  readonly controls?: ControlSettings;
  readonly appTheme?: AppTheme;
  readonly musicOn?: boolean;
}
