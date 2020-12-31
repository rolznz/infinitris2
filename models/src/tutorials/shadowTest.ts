import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const shadowTest: Tutorial = {
  id: 'shadow-test',
  title: 'Shadow Test',
  locale: 'en',
  description: '',
  highlightScore: true,
  layout: tetrominoes.T,
  successLinesCleared: [2],
  grid: `
X000000X
00000000
00000000
00000000
00000000
00000000
00000000
X000000X
`,
  layoutRotation: 2,
};

export default shadowTest;
