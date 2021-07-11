import InputAction from './InputAction';
import ISimulationSettings from './ISimulationSettings';
import ChallengeRewardCriteria from './ChallengeRewardCriteria';
import IEntity, {
  Creatable,
  IEntityReadOnlyProperties,
  Updatable,
} from './IEntity';

export interface IRateable {
  readonly numRatings: number;
  readonly summedRating: number;
  readonly rating: number;
}
export interface IChallengeReadOnlyProperties
  extends IEntityReadOnlyProperties,
    IRateable {
  readonly userId?: string;
}

export type CreatableChallenge = Creatable<IChallenge>;
export type UpdatableChallenge = Updatable<IChallenge>;

export interface IChallenge extends IEntity {
  readonly readOnly: IChallengeReadOnlyProperties;
  readonly title: string;
  readonly description?: string;

  readonly priority?: number;
  readonly isOfficial?: boolean;
  readonly isMandatory?: boolean;
  readonly isPublished?: boolean;
  readonly locale?: string;
  readonly firstBlockLayoutId?: string;
  //readonly firstBlockColumn?: number;
  readonly grid: string;

  readonly finishCriteria: {
    readonly maxBlocksPlaced?: number;
    readonly maxLinesCleared?: number;
    readonly maxTimeTaken?: number;
    readonly gridEmpty?: boolean;
  };

  readonly simulationSettings?: ISimulationSettings;

  readonly rewardCriteria: {
    bronze?: ChallengeRewardCriteria;
    silver?: ChallengeRewardCriteria;
    gold?: ChallengeRewardCriteria;
    all?: ChallengeRewardCriteria;
  };
}
