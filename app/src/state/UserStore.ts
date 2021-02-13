import { useDocument } from '@nandorojo/swr-firestore';
import {
  DEFAULT_KEYBOARD_CONTROLS,
  InputAction,
  InputMethod,
  IUser,
  TutorialStatus,
} from 'infinitris2-models';
import { fuego, getUserPath } from '../firebase';
import removeUndefinedValues from '../utils/removeUndefinedValues';
import useAuthStore from './AuthStore';
import useLocalUserStore from './LocalUserStore';

export function useUser(): IUser {
  const localUser = useLocalUserStore((store) => store.user);
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: user } = useDocument<IUser>(
    authStoreUserId ? getUserPath(authStoreUserId) : null
  );
  return {
    ...localUser,
    ...(user || {}),
  };
}

export default function useUserStore() {
  const user = useUser();
  const [updateLocalUser, signoutLocalUser] = useLocalUserStore((store) => [
    store.updateUser,
    store.signOut,
  ]);
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const {
    data: fireStoreUserDoc,
    update: updateFirestoreDoc,
  } = useDocument<IUser>(authStoreUserId ? getUserPath(authStoreUserId) : null);

  const updateUser = (changes: Partial<IUser>) => {
    const cleanedChanges = removeUndefinedValues(changes);
    if (fireStoreUserDoc) {
      updateFirestoreDoc(changes);
    }
    updateLocalUser(cleanedChanges);
  };

  return {
    user,
    setNickname: (nickname: string) => {
      updateUser({
        nickname,
      });
    },
    setLocale: (locale: string) => {
      updateUser({ locale });
    },
    markHasSeenWelcome: () => {
      updateUser({ hasSeenWelcome: true });
    },
    setPreferredInputMethod: (
      preferredInputMethod: InputMethod | undefined
    ) => {
      updateUser({ preferredInputMethod });
    },
    addTutorialAttempt: (tutorialId: string, attempt: TutorialStatus) => {
      const attempts = user.tutorialAttempts[tutorialId] || [];
      updateUser({
        tutorialAttempts: {
          ...user.tutorialAttempts,
          [tutorialId]: [...attempts, attempt],
        },
      });
    },
    completeTutorial: (tutorialId: string) => {
      updateUser({
        completedTutorialIds: [...user.completedTutorialIds, tutorialId],
      });
    },
    updateControl: (inputAction: InputAction, control: string) => {
      updateUser({ controls: { ...user.controls, [inputAction]: control } });
    },
    resetControls: () => {
      updateUser({ controls: DEFAULT_KEYBOARD_CONTROLS });
    },
    clearProgress: () => {
      updateUser({ completedTutorialIds: [], tutorialAttempts: {} });
    },
    signOut: () => {
      signoutLocalUser();
      fuego.auth().signOut();
    },
  };
}
