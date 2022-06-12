import useAuthStore from '../state/AuthStore';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const firebaseOptions = process.env.REACT_APP_FIREBASE_OPTIONS as string;

if (!firebaseOptions) {
  throw new Error('REACT_APP_FIREBASE_OPTIONS unset');
}

const app = initializeApp(JSON.parse(firebaseOptions));

const auth = getAuth(app);
auth.useDeviceLanguage();
onAuthStateChanged(auth, async (user) => {
  useAuthStore.getState().setUser(user);
});

export const storage = getStorage(app);
export { auth };
