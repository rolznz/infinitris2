import tetrominoes from '../layouts/Tetrominoes';
import ITutorial from '../ITutorial';

const garbageCollection1: ITutorial = {
  id: 'garbage-collection-1',
  title: 'Garbage Collection 1',
  description: '',
  locale: 'en',
  layout: tetrominoes.T,
  mandatory: true,
  priority: 8000,
  finishCriteria: {
    finishTutorialCellFilled: true,
  },
  successCriteria: {
    gold: {
      maxBlocksPlaced: 20,
    },
    silver: {
      maxBlocksPlaced: 40,
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
};

export default garbageCollection1;
