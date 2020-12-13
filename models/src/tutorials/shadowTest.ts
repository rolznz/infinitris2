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
X0000000000000000000000000X
000000000000000000000000000
000000000000000000000000000
000000000000000000000000000
000000000000000000000000000
000000000000000000000000000
000000000000000000000000000
X0000000000000000000000000X
`,
  layoutRotation: 2,
};

export default shadowTest;
