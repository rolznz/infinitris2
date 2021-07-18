export const nicknamesPath = 'nicknames';
export const getNicknamePath = (nicknameId: string) =>
  `${nicknamesPath}/${nicknameId}`;
export const colorsPath = 'colors';
export const getColorPath = (colorId: string) => `${colorsPath}/${colorId}`;
export const usersPath = 'users';
export const getUserPath = (userId: string) => `${usersPath}/${userId}`;
export const affiliatesPath = 'affiliates';
export const getAffiliatePath = (affiliateId: string) =>
  `${affiliatesPath}/${affiliateId}`;
export const scoreboardEntriesPath = 'scoreboardEntries';
export const roomsPath = 'rooms';
export const getRoomPath = (roomId: string) => `${roomsPath}/${roomId}`;
export const challengesPath = 'challenges';
export const getChallengePath = (challengeId: string) =>
  `${challengesPath}/${challengeId}`;
export const ratingsPath = 'ratings';
export const getRatingPath = (
  entityCollection: 'challenges',
  entityId: string,
  userId: string
) => `${ratingsPath}/${entityCollection}-${entityId}-${userId}`;
export const adminsPath = 'admins';
export const getAdminPath = (adminId: string) => `${adminsPath}/${adminId}`;

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
