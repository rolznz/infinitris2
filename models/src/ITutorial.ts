import InputAction from './InputAction';
import Layout from './Layout';
import garbageCollection1 from './tutorials/garbageCollection1';
import basicMovement from './tutorials/movement1';
import shadowTest from './tutorials/shadowTest';
import wrapTest from './tutorials/wrapTest';
import controlCheck from './tutorials/controlCheck';
import ISimulationSettings from './ISimulationSettings';

export interface TutorialTranslation {
  title: string;
  description?: string;
}

// TODO: rename to Challenge?
export default interface ITutorial extends TutorialTranslation {
  readonly id: string;
  readonly priority?: number;
  readonly mandatory?: boolean;
  readonly locale: string;
  readonly translations?: { [locale: string]: TutorialTranslation };
  readonly layout?: Layout;
  readonly grid?: string;
  readonly gridNumRows?: number;
  readonly gridNumColumns?: number;

  readonly highlightScore?: boolean;
  readonly layoutRotation?: number;
  readonly allowedActions?: InputAction[];
  readonly maxBlocks?: number;
  readonly successLinesCleared?: number;

  readonly simulationSettings?: ISimulationSettings;
  readonly teachControls?: boolean;
}

// TODO: rename to core tutorials (user-submitted ones will be from Firebase)
export const tutorials: ITutorial[] = [
  controlCheck,
  garbageCollection1,
  basicMovement,
  shadowTest,
  wrapTest,
];
