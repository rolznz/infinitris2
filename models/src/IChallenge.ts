import InputAction from './InputAction';
import Layout from './Layout';
import garbageCollection1 from './exampleChallenges/garbageCollection1';
import basicMovement from './exampleChallenges/basicMovement';
import shadowTest from './exampleChallenges/shadowTest';
import wrapTest from './exampleChallenges/wrapTest';
import controlCheck from './exampleChallenges/controlCheck';
import ISimulationSettings from './ISimulationSettings';
import ChallengeSuccessCriteria from './ChallengeSuccessCriteria';
import keysAndLocks1 from './exampleChallenges/keysAndLocks1';

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

export const exampleChallenges: IChallenge[] = [
  keysAndLocks1,
  controlCheck,
  basicMovement,
  garbageCollection1,
  shadowTest,
  wrapTest,
];
