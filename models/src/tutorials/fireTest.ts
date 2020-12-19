import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const fireTest: Tutorial = {
  title: 'Movement 1',
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
FFFF
0000
0000
0000
0000
`,
  layoutRotation: 2,
};

export default fireTest;
