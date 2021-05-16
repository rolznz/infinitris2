// This import loads the firebase namespace along with all its type information.
import * as firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import useAuthStore from '../state/AuthStore';
import { Fuego } from '@nandorojo/swr-firestore';

const firebaseOptions = process.env.REACT_APP_FIREBASE_OPTIONS as string;

if (!firebaseOptions) {
  throw new Error('REACT_APP_FIREBASE_OPTIONS unset');
}

// Fuego will call firebase.initializeApp()
export const fuego = new Fuego(JSON.parse(firebaseOptions));

firebase.auth().useDeviceLanguage();

firebase.auth().onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
});

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
export const getRatingsPath = (
  entityCollection: 'challenges',
  entityId: string,
  userId: string
) => `${ratingsPath}/${entityCollection}-${entityId}-${userId}`;
