// This import loads the firebase namespace along with all its type information.
import * as firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseOptions = process.env.REACT_APP_FIREBASE_OPTIONS as string;

if (!firebaseOptions) {
  throw new Error('REACT_APP_FIREBASE_OPTIONS unset');
}

firebase.initializeApp(JSON.parse(firebaseOptions));

if (!process.env.REACT_APP_DISABLE_PERSISTENCE) {
  firebase.firestore().enablePersistence();
}
