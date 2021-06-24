import {
  CreateChallengeRequest,
  getAdminPath,
  getChallengePath,
  getUserPath,
  IUser,
  IChallenge,
  DEFAULT_KEYBOARD_CONTROLS,
  Timestamp,
  getRatingPath,
  CreateRatingRequest,
  getAffiliatePath,
  getUserRequestPath,
  IReferredByAffiliateRequest,
  IAffiliate,
} from 'infinitris2-models';

const createdTimestamp: Timestamp = {
  seconds: 1622246405,
  nanoseconds: 0,
};

const userId1 = 'userId1';
const userId2 = 'userId2';
const userId3 = 'userId3';
const user1Path = getUserPath(userId1);
const user2Path = getUserPath(userId2);

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

const validRatingRequest: CreateRatingRequest = {
  entityCollection: 'challenges',
  entityId: challengeId1,
  value: 3,
};

const rating1Path = getRatingPath(
  validRatingRequest.entityCollection,
  validRatingRequest.entityId,
  userId2
);

const affiliateId1 = 'affiliateId1';
const affiliate1Path = getAffiliatePath(affiliateId1);
const affiliate1: IAffiliate = {
  readOnly: {
    numConversions: 0,
    userId: userId2,
  },
};

const referredByAffiliateRequestPath = getUserRequestPath(
  userId1,
  'referredByAffiliate'
);
const referredByAffiliateRequest: IReferredByAffiliateRequest = {
  referredByAffiliateId: affiliateId1,
};

const dummyData = {
  userId1,
  userId2,
  userId3,
  user1AdminPath,
  user1Path,
  user2Path,
  existingUser,
  validUserRequest,
  challengeId1,
  challenge1Path,
  existingPublishedChallenge,
  existingUnpublishedChallenge,
  validChallengeRequest,
  rating1Path,
  validRatingRequest,
  affiliateId1,
  affiliate1Path,
  affiliate1,
  referredByAffiliateRequestPath,
  referredByAffiliateRequest,
};

export default dummyData;
