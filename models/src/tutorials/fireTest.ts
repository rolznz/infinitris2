import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const fireTest: Tutorial = {
  title: 'Movement 1',
  description: '',
  highlightScore: true,
  layout: tetrominoes.T,
  successLinesCleared: [2],
  grid: `
000
000
000
000
000
000
FFF
000
000
000
000
`,
  layoutRotation: 2,
};

export default fireTest;
