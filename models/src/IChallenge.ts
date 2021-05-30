import InputAction from './InputAction';
import ISimulationSettings from './ISimulationSettings';
import ChallengeRewardCriteria from './ChallengeSuccessCriteria';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export interface IChallengeReadOnlyProperties
  extends IEntityReadOnlyProperties {
  readonly userId?: string;
}

export default interface IChallenge extends IEntity {
  readonly readOnly?: IChallengeReadOnlyProperties;
  readonly title: string;
  readonly description?: string;

  readonly priority?: number;
  readonly isOfficial?: boolean;
  readonly isMandatory?: boolean;
  readonly isPublished?: boolean;
  readonly locale?: string;
  readonly firstBlockLayoutId?: string;
  readonly firstBlockColumnOffset?: number;
  readonly grid: string;
  readonly numRatings?: number;
  readonly totalRating?: number;

  readonly finishCriteria: {
    readonly maxBlocksPlaced?: number;
    readonly maxLinesCleared?: number;
    readonly maxTime?: number;
    readonly emptyGrid?: boolean;
    readonly finishChallengeCellFilled?: boolean;
  };

  readonly simulationSettings?: ISimulationSettings;

  readonly rewardCriteria: {
    bronze?: ChallengeRewardCriteria;
    silver?: ChallengeRewardCriteria;
    gold?: ChallengeRewardCriteria;
    all?: ChallengeRewardCriteria;
  };
}
