import InputAction from './InputAction';
import Layout from './Layout';
import movement1 from './tutorials/movement1';
import shadowTest from './tutorials/shadowTest';
import wrapTest from './tutorials/wrapTest';

export default interface Tutorial {
  readonly title: string;
  readonly description: string;
  readonly layout?: Layout;
  readonly grid?: string;
  readonly highlightScore?: boolean;
  readonly layoutRotation?: number;
  readonly allowedActions?: InputAction[];
  readonly successLinesCleared?: number[];
  //readonly blockLimit?: number;  // TODO: is this needed?
}

// TODO: move to firebase
export const tutorials: Tutorial[] = [shadowTest, wrapTest, movement1];
