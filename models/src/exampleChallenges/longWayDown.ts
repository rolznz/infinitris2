import { IChallenge } from '../IChallenge';
import { exampleChallengeDefaultFields } from './exampleChallengeDefaultFields';

const longWayDown: IChallenge = {
  ...exampleChallengeDefaultFields,
  isOfficial: true,
  title: 'A long way down',
  description: '',
  locale: 'en',
  isMandatory: true,
  isPublished: true,
  priority: 8000,
  simulationSettings: {},
  finishCriteria: {},
  rewardCriteria: {
    gold: {
      maxBlocksPlaced: 10,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
  },
  // eslint-disable-next-line max-len
  grid: '00s00\n00000\n00100\n00000\nX0XXX\nXXX0X\nXXRXX\nrXrXr\nWWXXX\nXXXWW\n00ggg\nGXXXX\nX0XXX\nggg00\nXXXX0\nXXX0X\n0XXXX\nXX0XX\nX000X\nXX0XX\n00b00\nX0X0X\nbB0Bb\nXX0XX\n00b00\n0XXX0\nXX0XX\nXXXXw\nXXXwX\nXXwXX\nXwXXX\nwXXXX\nXwXXX\nXXwXX\nXXXwX\nXXXXw\ny00yy\nyy0yy\nyY0yy\nXXyXX\nXWWWW\nWXWWW\nWWXWW\nWWWXW\nWWWWX\nXWWWW\nWXWWW\nWWXWW\nWWWXW\nFFFFF\n',
  created: true,
};

export default longWayDown;
