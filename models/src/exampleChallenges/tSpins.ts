import { IChallenge } from '../IChallenge';

const tSpins1: IChallenge = {
  isOfficial: true,
  title: 'T Spins 1',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 8000,
  simulationSettings: {
    allowedBlockLayoutIds: ['T'],
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
  grid: `
0000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000
0000000000000XX0000XX0000000000000000000000000
0000000000000X0000XX00000000000000000000000000
000000XX0X00XXBXXXX00XXXX000000000000000000000
XXXXRRRXXXGrGXgBXXXX00XXXXXXXXXXXXXXXXXXXXXXXX
XXXXXRXXXXXGXXBXXXX00XXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXX0XXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXX000XXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXX000XXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXX00bXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXFXXXXXXXXXXXXXXXXXXXXXXX

`,
  readOnly: {
    numRatings: 0,
    rating: 0,
    summedRating: 0,
    createdTimestamp: { seconds: 0, nanoseconds: 0 },
    lastModifiedTimestamp: { seconds: 0, nanoseconds: 0 },
    numTimesModified: 0,
  },
  created: true,
};

export default tSpins1;
