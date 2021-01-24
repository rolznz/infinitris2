import ITutorial from '../ITutorial';

const keysAndLocks1: ITutorial = {
  id: 'keys-and-locks-1',
  title: 'Keys and Locks 1',
  description: '',
  locale: 'en',
  mandatory: true,
  priority: 7000,
  finishCriteria: {
    finishTutorialCellFilled: true,
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
