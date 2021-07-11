import { IChallenge } from '../IChallenge';

const waferTest: IChallenge = {
  isOfficial: true,
  title: 'Wafers 1',
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
000000000000000
000000000000000
000000000000000
000000000000000
WWWWWWWWWWWWWWW
000000000000000
000000000000000
000000000000000
000R00000000000
000W00000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
rrrrrrrrrrrrrrr
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

export default waferTest;
