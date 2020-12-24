import InputAction from './InputAction';
import Layout from './Layout';
import fireTest from './tutorials/laserTest';
import garbageCollection1 from './tutorials/garbageCollection1';
import basicMovement from './tutorials/movement1';
import shadowTest from './tutorials/shadowTest';
import wrapTest from './tutorials/wrapTest';
import controlCheck from './tutorials/controlCheck';
import ISimulationSettings from './ISimulationSettings';

export default interface Tutorial {
  readonly id: string;
  readonly priority?: number;
  readonly mandatory?: boolean;
  readonly title: string;
  readonly description: string;
  readonly layout?: Layout;
  readonly grid?: string;
  readonly gridNumRows?: number;
  readonly gridNumColumns?: number;

  readonly highlightScore?: boolean;
  readonly layoutRotation?: number;
  readonly allowedActions?: InputAction[];
  readonly successLinesCleared?: number[];

  readonly simulationSettings?: ISimulationSettings;
  readonly teachControls?: boolean;
}

// TODO: move to firebase
export const tutorials: Tutorial[] = [
  controlCheck,
  fireTest,
  basicMovement,
  wrapTest,
  garbageCollection1,
  shadowTest,
];

export const coreTutorials = {
  controlCheck,
};
