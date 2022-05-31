import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const bugfix: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Bugfix',
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
  00S000000X0s00000000
000000000X0000000000
000000000X0000000000
000000000X00000L0000
000000000X00000L000L
000000000X00000L00LL
XXSXXWWWWXXXXXXXXXXX
000000WRWX0000000000
000000WWWX0000000000
000000000X0000000000
000000000X0000000000
00X000000X00XrrrrrX0
00X000000X00X00000X0
B0X000000X00XbbbbbX0
XXXXXXXXXXXXXFFFFFXX


  
`,
  created: true,
};

export default bugfix;
