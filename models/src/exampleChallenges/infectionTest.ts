import { IChallenge } from '../IChallenge';

const infectionTest: IChallenge = {
  isOfficial: true,
  title: 'Infection 1',
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
000R00000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000I00000000000
00XXX0000000000
rrrrrrrrrrrrrrr
FFFFFFFFFFFFFFF
`,
  readOnly: {
    numRatings: 0,
    rating: 0,
    summedRating: 0,
  },
};

export default infectionTest;
