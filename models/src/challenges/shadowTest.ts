import tetrominoes from '../layouts/Tetrominoes';
import IChallenge from '../IChallenge';

const shadowTest: IChallenge = {
  id: 'shadow-test',
  userId: '',
  isOfficial: true,
  title: 'Shadow Test',
  locale: 'en',
  description: '',
  layout: tetrominoes.T,
  isPublished: false,
  finishCriteria: {},
  successCriteria: {},
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
};

export default shadowTest;