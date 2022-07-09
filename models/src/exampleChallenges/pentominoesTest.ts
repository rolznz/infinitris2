import pentominoes from '@models/blockLayouts/Pentominoes';
import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const pentominoesTest: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Pentominoes Test',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 7000,
  simulationSettings: {
    layoutSetId: pentominoes.id,
  },
  grid: `
000000s00000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
00F000000000000
`,
  created: true,
};

export default pentominoesTest;
