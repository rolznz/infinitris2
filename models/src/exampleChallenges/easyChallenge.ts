import { ChallengeAttemptRecording } from '@models/IChallengeAttempt';
import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const easyChallenge: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Easy',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 9000,
  // eslint-disable-next-line max-len
  grid: '0000000000\n0000000000\n0000000000\n0000000000\n0000000000\n0000000000\n0000000XXX\n0000000XRX\nrrrrrrrrrr\nFFFFFFFFFF\n',
  userId: 'LgXo3zTbNvavh9m6drXkALniLvi1',
  created: true,
};

export default easyChallenge;
