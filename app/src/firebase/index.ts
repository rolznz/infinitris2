// This import loads the firebase namespace along with all its type information.
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import useAuthStore from '../state/AuthStore';

const firebaseOptions = process.env.REACT_APP_FIREBASE_OPTIONS as string;

if (!firebaseOptions) {
  throw new Error('REACT_APP_FIREBASE_OPTIONS unset');
}

type Config = Parameters<typeof firebase.initializeApp>[0];

class Fuego {
  public db: ReturnType<firebase.app.App['firestore']>;
  public auth: typeof firebase.auth;
  public functions: typeof firebase.functions;
  public storage: typeof firebase.storage;
  constructor(config: Config) {
    this.db = !firebase.apps.length
      ? firebase.initializeApp(config).firestore()
      : firebase.app().firestore();
    this.auth = firebase.auth;
    this.functions = firebase.functions;
    this.storage = firebase.storage;
  }
}

// Fuego will call firebase.initializeApp()
export const fuego = new Fuego(JSON.parse(firebaseOptions));

firebase.auth().useDeviceLanguage();

firebase.auth().onAuthStateChanged((user) => {
  useAuthStore.getState().setUser(user);
});

export const storage = firebase.storage();
