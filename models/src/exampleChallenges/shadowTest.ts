import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const shadowTest: IChallenge = {
  ...exampleChallengeDefaultFields,
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
  created: true,
};

export default shadowTest;
