import InputAction from '../InputAction';
import tetrominoes from '../exampleBlockLayouts/Tetrominoes';
import IChallenge from '../IChallenge';

const wrapTest: IChallenge = {
  id: 'wrap-test',
  userId: '',
  isOfficial: true,
  title: 'Wrap Test',
  locale: 'en',
  description: '',
  isPublished: false,
  finishCriteria: {},
  successCriteria: {},
  grid: `
X00000000000000000000000000000000000000000000000X
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000
X00000000000000000000000000000000000000000000000X
`,
};

export default wrapTest;