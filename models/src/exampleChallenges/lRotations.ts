import { exampleChallengeDefaultFields } from '@models/exampleChallenges/exampleChallengeDefaultFields';
import { IChallenge } from '@models/IChallenge';

export const lRotations: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Outside The Box',
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
  // eslint-disable-next-line max-len
  grid: '0000X0s00X0000000000\n0000X0000X0000000000\n0000X0000X0000000000\n0000XX00XX0000000000\n0000XX00XX0000000000\n0000XX00XX0000000000\n0000XX00XX0000000000\n0000XX00XX0000000000\n0000XX00XX0000000000\n0000XX00XX0000XX0000\n0000rr00XX0000XX00XX\nXX00rr00XX0000XX00XX\nXXXXrr00XX0000XXXXXX\nXXXXXX00XX0000XXXXXX\nXXXXXX0RXX0000XXXXXX\nXXXXXX0XXX0000XXXXXX\n',
  created: true,
  simulationSettings: {
    layoutSetId: 'lsOnly',
  },
};
