import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const rockTest: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Rock Test',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 7000,
  finishCriteria: {},
  rewardCriteria: {
    gold: {
      maxBlocksPlaced: 10,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
  },
  simulationSettings: {
    layoutSetId: 'lsOnly',
  },
  grid: `
0000XXXXXXXXXX00000000000000XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX00
0000XXXXXXXXXX00000000000000XXXXXXXXXXXXXXXXXSXXXXXXXXSSSSSSXX00
0000XXXXXXXXXX00000000000000XXXXX000000000000000000000000000XX00
0000XXXXXXXXXX00000000000000XXXXX000000000000000000000000000XX00
0000XXXXXXXXXX00000000000000XXXXX000s00000000000000000000000XX00
0000XXXXXXXXXX00000000000000XXXXX000213456000000000000000000XX00
0000XXXXXXXXXX00000000000000XXXXX000213456000000000000000000XX00
0000XXXXXXXXXX00000000000000XXXXX000213456000000000000000000XX00
000000000000XX00000000000000XXXXX000213456000000000000000000XX00
000000000000XXWWWWWWWWWWWWWWXXXXX000213456000000000000000000XX00
0000XX000000XXWWWWWWWWWWWWWWXXXXX000213456000000000000000000XX00
0000XX000000XX00000000000000XXXXX000213456000000000000000000XX00
0000XX000000XX00000000000000XXXXXXXXXXXXXXXXXXXXXXXXXX000000XX00
0000XXDD00DDXXFFFFFFFFFFFFFFXXXXXXXXXXXXXXXXXXXXXXXXXX000000XX00
0000XXDD00DDXXFFFFFFFFFFFFFFXXXXXXXXXXXXXXXXXXXXXXXXXX0000000000
0000XX000000XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0000000000
0000XX000000XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0000000000
0000XX0000000000000000000000XXXXXXXXXXXXXXXXXXXXXXXXXX0000000000
0000XX0000000000000000000000XXXXXXXXXXXXXXXXXXXXXXXXXX0000000000
0000XXDDDDDD0000000000000000XXXXXXXXXXXXXXXXXXXXXXXXXXDDDDDDDD00
0000XXDDDDDD0000000000000000XXXXXXXXXXXXXXXXXXXXXXXXXXDDDDDDDD00

  
`,
  created: true,
};

export default rockTest;
