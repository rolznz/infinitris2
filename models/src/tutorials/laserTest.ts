import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const fireTest: Tutorial = {
  id: 'fire-test',
  title: 'Fire Test',
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
LLLL
0000
0000
0000
0000
`,
  layoutRotation: 2,
};

export default fireTest;
