import tetrominoes from '../Tetrominoes';
import ITutorial from '../ITutorial';

const garbageCollection1: ITutorial = {
  id: 'garbage-collection-1',
  title: 'Garbage Collection 1',
  description: '',
  locale: 'en',
  highlightScore: true,
  layout: tetrominoes.T,
  //successOnEmptyGrid: true
  //successLinesCleared: 2,
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
