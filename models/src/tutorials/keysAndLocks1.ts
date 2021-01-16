import tetrominoes from '../layouts/Tetrominoes';
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
  successCriteria: {},
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
000000000000000
00000000000000R
rrrrrrrrrrrrrrr
0XX00X000XX0XXX
00X0X00XX0X0X00
0X00X00XX0X0X0X
000000G00000000
bbbbbbbbbbbbbbb
FFFFFFFFFFFFFFF
`,
};

export default keysAndLocks1;
