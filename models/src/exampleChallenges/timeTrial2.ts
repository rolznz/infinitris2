import osOnly from '@models/blockLayouts/osOnly';
import sShapesOnly from '@models/blockLayouts/sShapesOnly';
import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const timeTrial2: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'timeTrial2',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 8000,
  simulationSettings: {
    layoutSetId: osOnly.id,
  },
  finishCriteria: {},
  rewardCriteria: {
    gold: {
      maxBlocksPlaced: 10,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
  },
  // eslint-disable-next-line max-len
  grid: '00s00000W00r00000000g00000000b00000000yI\ny0000000W00d00000000n00000000e00000000yy\nywywyy00W00r00rdrdrdg00gngngnb00bebebeyw\n00000000W00d00000000n00000000e00000000w0\n00000000W00r00000000g00000000b00000000y0\n0ywywywyW00ddrdrdr00ngngngg00ebebebb00w0\n0wWWWWWWW00r00000000g00000000b00000000y0\n0yW00000000d00000000n00000000e00000000w0\n0wW00000000r00rdrdrdg00gngngnb00bebebey0\n0yW00drdrdrd00000rWWn00000gWWe00000bWWw0\n0wW00000dWWr00000dWWg00000nWWb00000eWWy0\n0yW00000rWWdrdr00rWWngng00gWWebeb00bWWw0\n0wWdrd00dWWWWWd00dWWWWWn00nWWWWWe00eWWy0\n0yW00000rdrdrdr00gngngng00bebebeb00ywyy0\n0wW00000d00000000n00000000e60000000w0000\n0yWFFdrdrR0000000gG0000000bB0000000yY000\n',
  created: true,
};

export default timeTrial2;
