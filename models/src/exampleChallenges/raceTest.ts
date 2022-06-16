import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const raceTest: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'Race 1',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 7000,
  simulationSettings: {
    gameModeType: 'race',
    botSettings: {
      numBots: 5,
    },
  },
  grid: {
    numRows: 16,
    numColumns: 60,
  },
  // finishCriteria: {},
  // rewardCriteria: {
  // },

  created: true,
};

export default raceTest;
