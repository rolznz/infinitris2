export const colorsPath = 'colors';
export const getColorPath = (colorId: string) => `${colorsPath}/${colorId}`;
export const usersPath = 'users';
export const getUserPath = (userId: string) => `${usersPath}/${userId}`;
const userRequestsPath = 'requests';
export const getUserRequestsPath = (userId: string, request: string) =>
  `${getUserPath(userId)}/{userRequestsPath}/{request}`;
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
export const getRatingsPath = (
  entityCollection: 'challenges',
  entityId: string,
  userId: string
) => `${ratingsPath}/${entityCollection}-${entityId}-${userId}`;
export const adminsPath = 'admins';
export const getAdminPath = (adminId: string) => `${adminsPath}/${adminId}`;
