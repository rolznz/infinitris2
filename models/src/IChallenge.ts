import InputAction from './InputAction';
import { SimulationSettings } from './SimulationSettings';
import ChallengeRewardCriteria from './ChallengeRewardCriteria';
import IEntity, {
  Creatable,
  IEntityReadOnlyProperties,
  Updatable,
} from './IEntity';
import { WorldType, WorldVariation } from '@models/WorldType';
import IUser from '@models/IUser';

export interface IRateable {
  readonly numRatings: number;
  readonly summedRating: number;
  readonly rating: number;
}
export interface IChallengeReadOnlyProperties
  extends IEntityReadOnlyProperties,
    IRateable {
  readonly numAttempts: number;
  readonly thumbnail?: string;
  readonly user?: Pick<IUser['readOnly'], 'nickname'>;
}

export type CreatableChallenge = Creatable<IChallenge>;
export type UpdatableChallenge = Updatable<IChallenge>;

export interface IChallenge extends IEntity {
  readonly readOnly?: IChallengeReadOnlyProperties;
  readonly title?: string;
  readonly description?: string;

  readonly priority?: number;
  readonly isOfficial?: boolean;
  readonly isMandatory?: boolean;
  readonly isPublished?: boolean;
  readonly isTemplate?: boolean;
  readonly locale?: string;
  //readonly firstBlockLayoutId?: string;
  //readonly firstBlockColumn?: number;
  readonly grid:
    | string
    | {
        readonly numRows: number;
        readonly numColumns: number;
      };

  readonly worldType?: WorldType;
  readonly worldVariation?: WorldVariation;

  readonly finishCriteria?: {
    readonly maxBlocksPlaced?: number;
    readonly maxLinesCleared?: number;
    readonly maxTimeTakenMs?: number;
    readonly gridEmpty?: boolean;
    readonly noMistakes?: boolean;
  };

  readonly simulationSettings?: SimulationSettings;

  readonly rewardCriteria?: {
    bronze?: ChallengeRewardCriteria;
    silver?: ChallengeRewardCriteria;
    gold?: ChallengeRewardCriteria;
    all?: ChallengeRewardCriteria;
  };
}
