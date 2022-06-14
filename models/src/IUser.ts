import ControlSettings from './ControlSettings';
import { InputMethod } from './InputMethod';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';
import Timestamp from './Timestamp';
import { AppTheme } from './AppTheme';
import { RendererQuality } from './RendererQuality';
import { RendererType } from './RendererType';
import { WorldType } from '@models/WorldType';

export interface IUserReadOnlyProperties extends IEntityReadOnlyProperties {
  readonly coins: number;
  readonly networkImpact: number;
  readonly nickname?: string;
  readonly colorId?: string;
  readonly email: string;
  readonly affiliateId?: string;
  readonly referredByAffiliateId?: string;
  readonly lastWriteTimestamp: Timestamp;
  readonly numWrites: number;
  readonly writeRate: number;
  readonly characterIds: string[];
  readonly isAdmin?: boolean;
}

export interface WithControls {
  readonly controls_keyboard?: ControlSettings;
  readonly controls_gamepad?: ControlSettings;
}

export type UnlockableFeature = 'playTypePicker' | WorldType;

export default interface IUser extends IEntity, WithControls {
  readonly readOnly: IUserReadOnlyProperties;
  readonly locale?: string;
  readonly preferredInputMethod?: InputMethod;
  readonly appTheme?: AppTheme;
  readonly musicOn?: boolean;
  readonly sfxOn?: boolean;
  readonly musicVolume?: number;
  readonly sfxVolume?: number;
  readonly rendererQuality?: RendererQuality;
  readonly rendererType?: RendererType;
  readonly selectedCharacterId?: string;
  readonly unlockedFeatures?: UnlockableFeature[];
  readonly completedOfficialChallengeIds?: string[];
}
