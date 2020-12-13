import InputAction from '../InputAction';
import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const shadowTest: Tutorial = {
  title: 'Movement 1',
  description: '',
  highlightScore: true,
  layout: tetrominoes.T,
  successLinesCleared: [2],
  grid: `
X00000000X
0000000000
0000000000
0000000000
0000000000
0000000000
0000000000
X00000000X
`,
  layoutRotation: 2,
};

export default shadowTest;
