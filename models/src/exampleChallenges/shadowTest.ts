import tetrominoes from '../exampleBlockLayouts/Tetrominoes';
import { IChallenge } from '../IChallenge';

const shadowTest: IChallenge = {
  isOfficial: true,
  title: 'Shadow Test',
  locale: 'en',
  description: '',
  isPublished: false,
  finishCriteria: {},
  rewardCriteria: {},
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
  readOnly: {
    numRatings: 0,
    rating: 0,
    summedRating: 0,
  },
};

export default shadowTest;
