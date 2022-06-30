import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const reverseLocks: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Reverse Locks',
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
  00000d000000000
  00000d000000000
  00000d000000000
  00000d000000000
  00000d000000000
  0ggg0d000000000
  0gBg0d000000000
  0ggg0d000000000
  00000d000000000
  00000d000000000
  00000d000000000
  00000d000000000
  00000d00000000R
  00000d00000000X
  rrrrrrrrrrrrrrr
  000000000000000
  000000000000000
  000000G00000000
  bbbbbbbbbbbbbbb
  FFFFFFFFFFFFFFF


  
`,
  created: true,
};

export default reverseLocks;
