import { IChallenge } from '../IChallenge';

const infectionTest2: IChallenge = {
  isOfficial: true,
  title: 'Infection 2',
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
  grid: `
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
00000000000000000000r000r0000
rrrr00000000rrrrrrrrr000rrrrr
000r00000000r0000000r000r0000
0r0r00000000r0r0r0r0r000r0r0r
000000000000000000r0r000r0r00
000000000000000000r0r000r0r00
000000000000000000r0r000r0r00
000000000000000000r0r000r0r00
000000000000000000r0r000r0r00
000000000000000000r0r000r0r00
000000000000000000r0r000r0r00
000000000000000000r0rFFFr0r00
00000000000XXX000XX0XXXXX0XXX
00000000000XRX000XXIXXXXXIXXX
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

export default infectionTest2;
