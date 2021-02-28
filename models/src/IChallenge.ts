import InputAction from './InputAction';
import Layout from './Layout';
import garbageCollection1 from './challenges/garbageCollection1';
import basicMovement from './challenges/basicMovement';
import shadowTest from './challenges/shadowTest';
import wrapTest from './challenges/wrapTest';
import controlCheck from './challenges/controlCheck';
import ISimulationSettings from './ISimulationSettings';
import ChallengeSuccessCriteria from './ChallengeSuccessCriteria';
import keysAndLocks1 from './challenges/keysAndLocks1';

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
  readonly layout?: Layout;
  readonly grid: string;

  readonly layoutRotation?: number;
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

// TODO: rename to core challenges (user-submitted ones will be from Firebase)
export const challenges: IChallenge[] = [
  keysAndLocks1,
  controlCheck,
  basicMovement,
  garbageCollection1,
  shadowTest,
  wrapTest,
];
