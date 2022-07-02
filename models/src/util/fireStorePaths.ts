import { SettingsKey } from '@models/SettingsType';

export const nicknamesPath = 'nicknames';
export const getNicknamePath = (nicknameId: string) =>
  getEntityPath(nicknamesPath, nicknameId);
export const charactersPath = 'characters';
export const getCharacterPath = (characterId: string) =>
  getEntityPath(charactersPath, characterId);
export const usersPath = 'users';
export const getUserPath = (userId: string) => getEntityPath(usersPath, userId);
export const affiliatesPath = 'affiliates';
export const getAffiliatePath = (affiliateId: string) =>
  getEntityPath(affiliatesPath, affiliateId);
export const scoreboardEntriesPath = 'scoreboardEntries';
export const getScoreboardEntryPath = (userId: string) =>
  getEntityPath(scoreboardEntriesPath, userId);
export const roomsPath = 'rooms';

export const getRoomId = (serverId: string, roomIndex: number) =>
  `${serverId}-${roomIndex}`;
export const getRoomPath = (roomId: string) => getEntityPath(roomsPath, roomId);
export const getServerRoomPath = (serverId: string, roomIndex: number) =>
  getRoomPath(getRoomId(serverId, roomIndex));
export const serversPath = 'servers';
export const getServerPath = (serverId: string) =>
  getEntityPath(serversPath, serverId);
export const serverKeysPath = 'serverKeys';
export const getServerKeyPath = (serverKey: string) =>
  getEntityPath(serverKeysPath, serverKey);
export const challengesPath = 'challenges';
export const getChallengePath = (challengeId: string) =>
  getEntityPath(challengesPath, challengeId);
export const settingsPath = 'settings';
export const getSettingPath = (settingId: SettingsKey) =>
  getEntityPath(settingsPath, settingId);
export const challengeAttemptsPath = 'challengeAttempts';
export const getChallengeAttemptPath = (challengeAttemptId: string) =>
  getEntityPath(challengeAttemptsPath, challengeAttemptId);
export const ratingsPath = 'ratings';
export const getRatingPath = (
  entityCollectionPath: typeof challengesPath,
  entityId: string,
  userId: string
) =>
  getEntityPath(
    ratingsPath,
    getUniqueUserEntityId(entityCollectionPath, entityId, userId)
  );

// requires subcollection to easily iterate through network impacts
// in order to create recursive network impacts
export const impactedUsersPath = 'impactedUsers';
export const networkImpactsPath = 'networkImpacts';
export const getImpactedUserNetworkImpactsPath = (userId: string) =>
  `${impactedUsersPath}/${userId}/${networkImpactsPath}`;
export const getNetworkImpactPath = (toUserId: string, fromUserId: string) =>
  `${impactedUsersPath}/${toUserId}/${networkImpactsPath}/${fromUserId}`;

export const getConversionPath = (
  affiliateId: string,
  convertedUserId: string
) => `${getAffiliatePath(affiliateId)}/conversions/${convertedUserId}`;

export const purchasesPath = 'purchases';
export const getPurchasePath = (
  entityCollectionPath: typeof charactersPath,
  entityId: string,
  userId: string
) =>
  getEntityPath(
    purchasesPath,
    getUniqueUserEntityId(entityCollectionPath, entityId, userId)
  );

export const donationsPath = 'donations';
export const paymentsPath = 'payments';
export const getPaymentPath = (paymentHash: string) =>
  getEntityPath(paymentsPath, paymentHash);

export const loginCodesPath = 'loginCodes';
export const getLoginCodePath = (email: string) =>
  getEntityPath(loginCodesPath, email);

export type EntityCollectionPath =
  | typeof usersPath
  | typeof challengesPath
  | typeof ratingsPath
  | typeof affiliatesPath
  | typeof roomsPath
  | typeof nicknamesPath
  | typeof challengeAttemptsPath
  | typeof charactersPath
  | typeof purchasesPath
  | typeof serversPath
  | typeof serverKeysPath
  | typeof paymentsPath
  | typeof loginCodesPath
  | typeof settingsPath
  | typeof scoreboardEntriesPath;

export function getEntityPath(
  entityCollectionPath: EntityCollectionPath,
  entityId: string
) {
  return `${entityCollectionPath}/${entityId}`;
}

// ratings and purchases have IDs based on the user who created them
// and the entity they are for to be easily retrievable
export function getUniqueUserEntityId(
  entityCollectionPath: EntityCollectionPath,
  entityId: string,
  userId: string
) {
  return `${entityCollectionPath}-${entityId}-${userId}`;
}
