import {
  CreateChallengeRequest,
  getAdminPath,
  getChallengePath,
  getUserPath,
  IUser,
  IChallenge,
  DEFAULT_KEYBOARD_CONTROLS,
  Timestamp,
  IRating,
  getRatingPath,
} from 'infinitris2-models';

const createdTimestamp: Timestamp = {
  seconds: 1622246405,
  nanoseconds: 0,
};

const userId1 = 'userId1';
const userId2 = 'userId2';
const user1Path = getUserPath(userId1);

const validUserRequest: Omit<IUser, 'readOnly'> = {
  controls: DEFAULT_KEYBOARD_CONTROLS,
  hasSeenAllSet: false,
  hasSeenWelcome: true,
  preferredInputMethod: 'keyboard',
  locale: 'EN',
};

const existingUser: IUser = {
  ...validUserRequest,
  readOnly: {
    createdTimestamp,
    nickname: 'Bob',
    networkImpact: 0,
    credits: 3,
    email: 'bob@gmail.com',
  },
};

const challengeId1 = 'challengeId1';
const challenge1Path = getChallengePath(challengeId1);
const user1AdminPath = getAdminPath(userId1);

const validChallengeRequest: CreateChallengeRequest = {
  title: 'New challenge',
  simulationSettings: {
    allowedBlockLayoutIds: ['1', '2'],
  },
  finishCriteria: {},
  rewardCriteria: {
    all: {
      maxTimeTaken: 60000,
    },
    bronze: {
      maxBlocksPlaced: 30,
    },
    silver: {
      maxBlocksPlaced: 20,
    },
    gold: {
      maxBlocksPlaced: 10,
    },
  },
  grid: `
  0000
  0000
  XXX0
  000X`,
};

const existingUnpublishedChallenge: IChallenge = {
  ...validChallengeRequest,
  readOnly: {
    createdTimestamp,
    userId: userId1,
    numRatings: 0,
    rating: 0,
    summedRating: 0,
  },
};

const existingPublishedChallenge: IChallenge = {
  ...existingUnpublishedChallenge,
  isPublished: true,
};

const validRatingRequest: Pick<
  IRating,
  'entityCollection' | 'entityId' | 'value'
> = {
  entityCollection: 'challenges',
  entityId: challengeId1,
  value: 3,
};

const rating1Path = getRatingPath(
  validRatingRequest.entityCollection,
  validRatingRequest.entityId,
  userId2
);

const dummyData = {
  userId1,
  userId2,
  user1AdminPath,
  user1Path,
  existingUser,
  validUserRequest,
  challengeId1,
  challenge1Path,
  existingPublishedChallenge,
  existingUnpublishedChallenge,
  validChallengeRequest,
  rating1Path,
  validRatingRequest,
};

export default dummyData;
