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
  IAffiliate,
  CreatableChallenge,
  UpdatableChallenge,
  CreatableRating,
  getConversionPath,
  IConversion,
  INickname,
  getNicknamePath,
  getColorPath,
  IColor,
  getPurchasePath,
  IPurchase,
  Creatable,
  IChallengeAttempt,
  getChallengeAttemptPath,
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
    purchasedEntityIds: [],
    lastWriteTimestamp: createdTimestamp,
    numWrites: 0,
    writeRate: 0,
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
      maxTimeTakenMs: 60000,
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
  userId: userId1,
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
    numAttempts: 0,
  },
  created: true,
};

const existingPublishedChallenge: IChallenge = {
  ...existingUnpublishedChallenge,
  isPublished: true,
};

const creatableRating: CreatableRating = {
  entityCollectionPath: 'challenges',
  entityId: challengeId1,
  value: 3,
  created: false,
  userId: userId2,
};

const rating1Path = getRatingPath(
  creatableRating.entityCollectionPath,
  creatableRating.entityId,
  userId2
);

const affiliateId1 = 'affiliateId1';
const affiliate1Path = getAffiliatePath(affiliateId1);
const affiliate1: IAffiliate = {
  readOnly: {
    numConversions: 0,
    createdTimestamp,
    lastModifiedTimestamp,
    numTimesModified: 0,
  },
  userId: userId2,
  created: true,
};

const conversion1Path = getConversionPath(affiliateId1, userId1);
const conversion1: IConversion = {
  created: false,
  userId: userId1,
};

const nicknameId1 = 'Bob';
const nicknameId2 = 'Alice';

const nickname1Path = getNicknamePath(nicknameId1);
const nickname2Path = getNicknamePath(nicknameId2);

const existingNickname: INickname = {
  readOnly: {
    createdTimestamp: createdTimestamp,
    lastModifiedTimestamp: createdTimestamp,
    numTimesModified: 0,
  },
  userId: userId1,
  created: true,
};
const creatableNickname: INickname = {
  created: false,
  userId: userId1,
};

const colorId1 = 'red';
const colorId2 = 'blue';
const color1Path = getColorPath(colorId1);
const color1: IColor = {
  readOnly: {
    createdTimestamp: createdTimestamp,
    lastModifiedTimestamp: createdTimestamp,
    numPurchases: 0,
    numTimesModified: 0,
  },
  price: 3,
  value: 0xff0000,
  created: true,
  userId: userId1,
};
const creatableColor: Creatable<IColor> = {
  value: 0xff0000,
  price: 3,
  created: false,
  userId: userId1,
};

const purchase1Path = getPurchasePath('colors', colorId1, userId1);
const purchase1: IPurchase = {
  entityCollectionPath: 'colors',
  entityId: colorId1,
  created: false,
  userId: userId1,
};

const challengeAttemptId1 = 'challenge-attempt-1';
const challengeAttempt1Path = getChallengeAttemptPath(challengeAttemptId1);

const creatableChallengeAttempt: Creatable<IChallengeAttempt> = {
  challengeId: challengeId1,
  medalIndex: 1,
  status: 'success',
  stats: {
    blocksPlaced: 1,
    linesCleared: 1,
    timeTakenMs: 3500,
  },
  created: false,
  userId: userId1,
};

// TODO: rename userId1 to user1Id etc
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
  nicknameId1,
  nicknameId2,
  nickname1Path,
  nickname2Path,
  creatableNickname,
  existingNickname,
  conversion1,
  conversion1Path,
  createdTimestamp,
  lastModifiedTimestamp,
  colorId1,
  colorId2,
  color1Path,
  color1,
  creatableColor,
  purchase1Path,
  purchase1,
  creatableChallengeAttempt,
  challengeAttemptId1,
  challengeAttempt1Path,
};

export default dummyData;
