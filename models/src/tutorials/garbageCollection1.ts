import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const garbageCollection1: Tutorial = {
  id: 'garbage-collection-1',
  title: 'Garbage Collection 1',
  description: '',
  highlightScore: true,
  layout: tetrominoes.T,
  successLinesCleared: [2],
  grid: `
0000
0000
0000
0000
0000
0000
0XXX
000X
0XXX
XX00
X0XX
`, // TODO: garbageRows=[5,6,7]
  layoutRotation: 2,
};

export default garbageCollection1;
