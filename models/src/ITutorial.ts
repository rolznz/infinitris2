import InputAction from './InputAction';
import Layout from './Layout';
import garbageCollection1 from './tutorials/garbageCollection1';
import basicMovement from './tutorials/basicMovement';
import shadowTest from './tutorials/shadowTest';
import wrapTest from './tutorials/wrapTest';
import controlCheck from './tutorials/controlCheck';
import ISimulationSettings from './ISimulationSettings';
import TutorialSuccessCriteria from './TutorialSuccessCriteria';
import keysAndLocks1 from './tutorials/keysAndLocks1';

export interface TutorialTranslation {
  title: string;
  description?: string;
}

// TODO: rename to Challenge?
export default interface ITutorial extends TutorialTranslation {
  readonly id: string;
  readonly priority?: number;
  readonly isMandatory?: boolean;
  readonly isPublished?: boolean;
  readonly locale: string;
  readonly translations?: { [locale: string]: TutorialTranslation };
  readonly layout?: Layout;
  readonly grid?: string;
  readonly gridNumRows?: number;
  readonly gridNumColumns?: number;

  readonly layoutRotation?: number;
  readonly allowedActions?: InputAction[];

  readonly finishCriteria: {
    readonly maxBlocks?: number;
    readonly maxLinesCleared?: number;
    readonly maxTime?: number;
    readonly emptyGrid?: boolean;
    readonly finishTutorialCellFilled?: boolean;
  };

  readonly simulationSettings?: ISimulationSettings;
  readonly teachControls?: boolean;

  readonly successCriteria: {
    bronze?: TutorialSuccessCriteria;
    silver?: TutorialSuccessCriteria;
    gold?: TutorialSuccessCriteria;
    all?: TutorialSuccessCriteria;
  };
}

// TODO: rename to core tutorials (user-submitted ones will be from Firebase)
export const tutorials: ITutorial[] = [
  keysAndLocks1,
  controlCheck,
  basicMovement,
  garbageCollection1,
  shadowTest,
  wrapTest,
];
