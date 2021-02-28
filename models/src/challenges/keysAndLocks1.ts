import IChallenge from '../IChallenge';

const keysAndLocks1: IChallenge = {
  id: 'keys-and-locks-1',
  userId: '',
  isOfficial: true,
  title: 'Keys and Locks 1',
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
};

export default keysAndLocks1;
