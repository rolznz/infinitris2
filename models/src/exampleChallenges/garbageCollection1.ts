import IChallenge from '../IChallenge';

const garbageCollection1: IChallenge = {
  id: 'garbage-collection-1',
  userId: '',
  isOfficial: true,
  title: 'Garbage Collection 1',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 8000,
  finishCriteria: {
    finishChallengeCellFilled: true,
  },
  rewardCriteria: {
    gold: {
      maxBlocksPlaced: 10,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
  },
  grid: `
00000
00000
00000
00000
00000
00000
00000
00000
00000
00000
00000
X0XXX
X000X
X0XXX
XXX00
0X0XX
FFFFF
`, // TODO: garbageRows=[5,6,7]
  createdTimestamp: { toDate: () => new Date() },
};

export default garbageCollection1;
