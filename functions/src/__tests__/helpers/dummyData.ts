import {
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
  getPurchasePath,
  IPurchase,
  Creatable,
  IChallengeAttempt,
  getChallengeAttemptPath,
  Updatable,
  getServerKeyPath,
  IServerKey,
  getServerPath,
  getRoomPath,
  IRoom,
  IServer,
  getRoomId,
  ICharacter,
  getCharacterPath,
  CustomizableInputAction,
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

const updatableUser: Updatable<IUser> = {
  controls_keyboard: DEFAULT_KEYBOARD_CONTROLS,
  preferredInputMethod: 'keyboard',
  locale: 'EN',
  userId: userId1,
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
    characterIds: [],
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

const updatableChallenge: UpdatableChallenge = {
  title: 'new challenge',
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

const characterId1 = 1;
const characterId2 = 2;
const character1Path = getCharacterPath(characterId1.toString());
const character1: ICharacter = {
  readOnly: {
    createdTimestamp: createdTimestamp,
    lastModifiedTimestamp: createdTimestamp,
    numTimesModified: 0,
  },
  numPurchases: 0,
  maxPurchases: 10,
  price: 3,
  patternFilename: '1.png',
  thumbnail: '1.png',
  color: '#ff0000',
  id: characterId1,
  name: 'blah',
  created: true,
  userId: userId1,
};

const purchase1Path = getPurchasePath(
  'characters',
  characterId1.toString(),
  userId1
);
const purchase1: IPurchase = {
  entityCollectionPath: 'characters',
  entityId: characterId1.toString(),
  created: false,
  userId: userId1,
};

const challengeAttemptId1 = 'challenge-attempt-1';
const challengeAttempt1Path = getChallengeAttemptPath(challengeAttemptId1);

const server1Id = 'server-1';
const server1Path = getServerPath(server1Id);
const server1: IServer = {
  created: true,
  name: 'Server 1',
  region: 'Asia',
  url: 'https://google.com',
  userId: userId1,
  version: 1,
};
const serverKey1Id = 'server-key-1';
const serverKey1Path = getServerKeyPath(serverKey1Id);
const serverKey1: IServerKey = {
  created: true,
  serverId: server1Id,
  userId: userId1,
};

const room1: IRoom = {
  created: true,
  maxPlayers: 3,
  numPlayers: 0,
  numBots: 0,
  numHumans: 0,
  numSpectators: 0,
  name: 'Room 1',
  roomIndex: 0,
  serverId: server1Id,
  userId: userId1,
  gameModeType: 'infinity',
};
const room1Id = getRoomId(server1Id, room1.roomIndex);
const room1Path = getRoomPath(room1Id);

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
  clientVersion: 'unknown',
  recording: {
    simulationRootSeed: 123,
    frames: [
      {
        actions: [
          {
            type: CustomizableInputAction.RotateClockwise,
            data: { rotateDown: true },
          },
        ],
      },
    ],
  },
};

// TODO: rename userId1 to user1Id etc
const dummyData = {
  userId1,
  userId2,
  userId3,
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
  characterId1,
  characterId2,
  character1Path,
  character1,
  purchase1Path,
  purchase1,
  creatableChallengeAttempt,
  challengeAttemptId1,
  challengeAttempt1Path,
  serverKey1Path,
  serverKey1,
  server1Id,
  server1,
  serverKey1Id,
  server1Path,
  room1Id,
  room1Path,
  room1,
};

export default dummyData;
