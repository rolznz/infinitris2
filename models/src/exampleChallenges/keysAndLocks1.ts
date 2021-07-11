import { IChallenge } from '../IChallenge';

const keysAndLocks1: IChallenge = {
  isOfficial: true,
  title: 'Keys and Locks 1',
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
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
0ggg00000000000
0gBg00000000000
0ggg00000000000
000000000000000
000000000000000
000000000000000
000000000000000
00000000000000R
00000000000000X
rrrrrrrrrrrrrrr
000000000000000
000000000000000
000000G00000000
bbbbbbbbbbbbbbb
FFFFFFFFFFFFFFF
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

export default keysAndLocks1;
