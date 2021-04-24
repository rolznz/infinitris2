import IChallenge from '../IChallenge';

const waferTest: IChallenge = {
  id: 'wafer-1',
  userId: '',
  isOfficial: true,
  title: 'Wafers 1',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 7000,
  finishCriteria: {
    finishChallengeCellFilled: true,
  },
  successCriteria: {
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
  createdTimestamp: { toDate: () => new Date() },
};

export default waferTest;
