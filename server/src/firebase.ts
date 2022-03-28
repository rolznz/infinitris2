import './fetch-polyfill';
import { ICharacter } from '@models/ICharacter';
import { charactersPath } from '@models/util/fireStorePaths';
import { initializeApp } from 'firebase/app';
import {
  query,
  collection,
  getDocs,
  initializeFirestore,
  limit,
} from 'firebase/firestore';

const firebaseOptions = process.env.FIREBASE_OPTIONS as string;

if (!firebaseOptions) {
  throw new Error('FIREBASE_OPTIONS unset');
}

const app = initializeApp(JSON.parse(firebaseOptions));

// force firebase to use long polling in order to work with node-fetch
// we are using the client API because lobby servers should have the same restricted access as the website
const firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
} as any);

export async function getCharacters(): Promise<ICharacter[]> {
  const result = await getDocs(query(collection(firestore, charactersPath)));
  return result.docs.map((doc) => doc.data() as ICharacter);
}
