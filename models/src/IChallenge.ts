import InputAction from './InputAction';
import ISimulationSettings from './ISimulationSettings';
import ChallengeSuccessCriteria from './ChallengeSuccessCriteria';

export interface ChallengeTranslation {
  title: string;
  description?: string;
}

// TODO: rename to Challenge
export default interface IChallenge extends ChallengeTranslation {
  readonly id: string;
  readonly userId: string;
  readonly priority?: number;
  readonly isOfficial: boolean;
  readonly isMandatory?: boolean;
  readonly isPublished?: boolean;
  readonly locale: string;
  readonly translations?: { [locale: string]: ChallengeTranslation };
  readonly firstBlockLayoutId?: string;
  readonly grid: string;
  readonly numRatings?: number;
  readonly totalRating?: number;

  //readonly layoutRotation?: number;
  readonly allowedActions?: InputAction[];

  readonly finishCriteria: {
    readonly maxBlocks?: number;
    readonly maxLinesCleared?: number;
    readonly maxTime?: number;
    readonly emptyGrid?: boolean;
    readonly finishChallengeCellFilled?: boolean;
  };

  readonly simulationSettings?: ISimulationSettings;
  readonly teachControls?: boolean;

  readonly successCriteria: {
    bronze?: ChallengeSuccessCriteria;
    silver?: ChallengeSuccessCriteria;
    gold?: ChallengeSuccessCriteria;
    all?: ChallengeSuccessCriteria;
  };
}
