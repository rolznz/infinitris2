import reverseLocks from '@models/exampleChallenges/reverseLocks';
import { lRotations } from '@models/exampleChallenges/lRotations';
import raceTest from '@models/exampleChallenges/raceTest';
import rockTest from '@models/exampleChallenges/rockTest';
import sBlock from '@models/exampleChallenges/sBlock';
import { IChallenge } from '../IChallenge';
import basicMovement from './basicMovement';
import garbageCollection1 from './garbageCollection1';
import infectionTest from './infectionTest';
import infectionTest2 from './infectionTest2';
import keysAndLocks1 from './keysAndLocks1';
import outsideTheBox from './outsideTheBox';
import shadowTest from './shadowTest';
import tSpins1 from './tSpins';
import waferTest from './waferTest';
import wrapTest from './wrapTest';

export const exampleChallenges: { [key: string]: IChallenge } = {
  'keys-and-locks-1': keysAndLocks1,
  think: outsideTheBox,
  'basic-movement': basicMovement,
  'garbage-collection-1': garbageCollection1,
  'shadow-test': shadowTest,
  'wrap-test': wrapTest,
  'wafer-1': waferTest,
  'infection-1': infectionTest,
  'infection-2': infectionTest2,
  't-spins-1': tSpins1,
  'rock-test': rockTest,
  'race-1': raceTest,
  'l-rotations': lRotations,
  'reverse-locks': reverseLocks,
  's-block': sBlock,
};
