import {
  getAdminPath,
  getChallengePath,
  getUserPath,
  IUser,
  IChallenge,
  DEFAULT_KEYBOARD_CONTROLS,
  Timestamp,
  getRatingPath,
  getAffiliatePath,
  getUserRequestPath,
  IReferredByAffiliateRequest,
  INicknameRequest,
  IAffiliate,
  CreatableChallenge,
  UpdatableChallenge,
  CreatableRating,
} from 'infinitris2-models';

const createdTimestamp: Timestamp = {
  seconds: 1622246405,
  nanoseconds: 0,
};

const lastModifiedTimestamp = createdTimestamp;

const userId1 = 'userId1';
const userId2 = 'userId2';
const userId3 = 'userId3';
const user1Path = getUserPath(userId1);
const user2Path = getUserPath(userId2);

const updatableUser: Omit<IUser, 'readOnly' | 'created'> = {
  controls: DEFAULT_KEYBOARD_CONTROLS,
  hasSeenAllSet: false,
  hasSeenWelcome: true,
  preferredInputMethod: 'keyboard',
  locale: 'EN',
};

const existingUser: IUser = {
  ...updatableUser,
  readOnly: {
    createdTimestamp,
    lastModifiedTimestamp,
    numTimesModified: 0,
    nickname: 'Bob',
    networkImpact: 0,
    coins: 3,
    email: 'bob@gmail.com',
  },
  created: true,
};

const challengeId1 = 'challengeId1';
const challengeId2 = 'challengeId2';
const challenge1Path = getChallengePath(challengeId1);
const challenge2Path = getChallengePath(challengeId2);
const user1AdminPath = getAdminPath(userId1);

const updatableChallenge: UpdatableChallenge = {
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

const creatableChallenge: CreatableChallenge = {
  ...updatableChallenge,
  created: false,
};

const existingUnpublishedChallenge: IChallenge = {
  ...updatableChallenge,
  readOnly: {
    createdTimestamp,
    lastModifiedTimestamp,
    numTimesModified: 0,

    userId: userId1,
    numRatings: 0,
    rating: 0,
    summedRating: 0,
  },
  created: true,
};

const existingPublishedChallenge: IChallenge = {
  ...existingUnpublishedChallenge,
  isPublished: true,
};

const creatableRating: CreatableRating = {
  entityCollection: 'challenges',
  entityId: challengeId1,
  value: 3,
  created: false,
};

const rating1Path = getRatingPath(
  creatableRating.entityCollection,
  creatableRating.entityId,
  userId2
);

const affiliateId1 = 'affiliateId1';
const affiliate1Path = getAffiliatePath(affiliateId1);
const affiliate1: IAffiliate = {
  readOnly: {
    numConversions: 0,
    userId: userId2,
    createdTimestamp,
    lastModifiedTimestamp,
    numTimesModified: 0,
  },
  created: true,
};

const userRequestId1 = 'userRequestId1';

const userRequest1Path = getUserRequestPath(userRequestId1);
const referredByAffiliateRequest: IReferredByAffiliateRequest = {
  referredByAffiliateId: affiliateId1,
  requestType: 'referredByAffiliate',
  created: false,
};

const nicknameRequest: INicknameRequest = {
  nickname: 'asdf1',
  requestType: 'nickname',
  created: false,
};

const dummyData = {
  userId1,
  userId2,
  userId3,
  user1AdminPath,
  user1Path,
  user2Path,
  existingUser,
  updatableUser,
  challengeId1,
  challenge1Path,
  challenge2Path,
  existingPublishedChallenge,
  existingUnpublishedChallenge,
  creatableChallenge,
  updatableChallenge,
  rating1Path,
  creatableRating,
  affiliateId1,
  affiliate1Path,
  affiliate1,
  userRequest1Path,
  referredByAffiliateRequest,
  nicknameRequest,
  createdTimestamp,
  lastModifiedTimestamp,
};

export default dummyData;
