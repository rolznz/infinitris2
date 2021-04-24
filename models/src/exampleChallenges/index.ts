import IChallenge from '../IChallenge';
import basicMovement from './basicMovement';
import controlCheck from './controlCheck';
import garbageCollection1 from './garbageCollection1';
import infectionTest from './infectionTest';
import infectionTest2 from './infectionTest2';
import keysAndLocks1 from './keysAndLocks1';
import outsideTheBox from './outsideTheBox';
import shadowTest from './shadowTest';
import waferTest from './waferTest';
import wrapTest from './wrapTest';

export const exampleChallenges: IChallenge[] = [
  keysAndLocks1,
  outsideTheBox,
  controlCheck,
  basicMovement,
  garbageCollection1,
  shadowTest,
  wrapTest,
  waferTest,
  infectionTest,
  infectionTest2,
];
