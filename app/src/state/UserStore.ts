import { useDocument } from '@nandorojo/swr-firestore';
import {
  DEFAULT_KEYBOARD_CONTROLS,
  InputAction,
  InputMethod,
  IUser,
  ChallengeStatus,
} from 'infinitris2-models';
import { StateSelector } from 'zustand';
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

type IUserStore = {
  user: IUser;
  setNickname(nickname: string): void;
  setLocale(locale: string): void;
  markHasSeenWelcome(): void;
  setPreferredInputMethod(preferredInputMethod: InputMethod | undefined): void;
  addChallengeAttempt(challengeId: string, attempt: ChallengeStatus): void;
  completeChallenge(challengeId: string): void;
  updateControl(inputAction: InputAction, control: string): void;
  resetControls(): void;
  clearProgress(): void;
  signOut(): void;
};

export function useUserStore(): IUserStore;
export function useUserStore<StateSlice>(
  selector: StateSelector<IUserStore, StateSlice>
): StateSlice;
export function useUserStore<StateSlice>(
  selector?: StateSelector<IUserStore, StateSlice>
): StateSlice | IUserStore {
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

  const state: IUserStore = {
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
    addChallengeAttempt: (challengeId: string, attempt: ChallengeStatus) => {
      const attempts = user.challengeAttempts[challengeId] || [];
      updateUser({
        challengeAttempts: {
          ...user.challengeAttempts,
          [challengeId]: [...attempts, attempt],
        },
      });
    },
    completeChallenge: (challengeId: string) => {
      updateUser({
        completedChallengeIds: [...user.completedChallengeIds, challengeId],
      });
    },
    updateControl: (inputAction: InputAction, control: string) => {
      updateUser({ controls: { ...user.controls, [inputAction]: control } });
    },
    resetControls: () => {
      updateUser({ controls: DEFAULT_KEYBOARD_CONTROLS });
    },
    clearProgress: () => {
      updateUser({ completedChallengeIds: [], challengeAttempts: {} });
    },
    signOut: () => {
      signoutLocalUser();
      fuego.auth().signOut();
    },
  };

  return selector ? selector(state) : state;
}
