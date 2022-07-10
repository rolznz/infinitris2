import pentominoes from '@models/blockLayouts/Pentominoes';
import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const pentominoesTest2: IChallenge = {
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
  // eslint-disable-next-line max-len
  grid: 'XXX0sXXXX\nXXX00XXXX\nXXX000XXX\nXXX000XXX\nXXX000XXX\nXXXX00XXX\nXXXrRRXXX\n000rrr000\n000000000\n000000000\n000000000\n000000000\n000000000\n000000000\n000000000\n000000X0X\n',
  created: true,
};

export default pentominoesTest2;
