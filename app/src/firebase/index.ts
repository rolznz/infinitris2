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

export const getUserPath = (userId: string) => `users/${userId}`;
export const roomsPath = 'rooms';
export const getRoomPath = (roomId: string) => `${roomsPath}/${roomId}`;
export const challengesPath = 'challenges';
export const getChallengePath = (challengeId: string) =>
  `${challengesPath}/${challengeId}`;
