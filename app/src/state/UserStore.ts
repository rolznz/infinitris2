import { useDocument } from 'swr-firestore';
import {
  DEFAULT_KEYBOARD_CONTROLS,
  getUserPath,
  IChallengeAttempt,
  InputAction,
  InputMethod,
  IUser,
  AppTheme,
} from 'infinitris2-models';
import { StateSelector } from 'zustand';
import { fuego } from '../firebase';
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
  readonly user: IUser;
  setNickname(nickname: string): void;
  setLocale(locale: string): void;
  markHasSeenWelcome(): void;
  markHasSeenAllSet(): void;
  setPreferredInputMethod(preferredInputMethod: InputMethod | undefined): void;
  addChallengeAttempt(challengeId: string, attempt: IChallengeAttempt): void;
  completeChallenge(challengeId: string): void;
  updateControl(inputAction: InputAction, control: string): void;
  resetControls(): void;
  clearProgress(): void;
  signOut(): void;
  resyncLocalStorage(userData: IUser): void;
  setAppTheme(appTheme: AppTheme): void;
  setMusicOn(musicOn: boolean): void;
};

export function getUpdatableUserProperties(
  user: Partial<IUser>
): Partial<IUser> {
  return {
    //nickname: user.nickname,
    //challengeAttempts: user.challengeAttempts,
    //completedChallengeIds: user.completedChallengeIds,
    controls: user.controls,
    hasSeenAllSet: user.hasSeenAllSet,
    hasSeenWelcome: user.hasSeenWelcome,
    preferredInputMethod: user.preferredInputMethod,
    locale: user.locale,
  };
}

export function useUserStore(): IUserStore;
export function useUserStore<StateSlice>(
  selector: StateSelector<IUserStore, StateSlice>
): StateSlice;
export function useUserStore<StateSlice>(
  selector?: StateSelector<IUserStore, StateSlice>
): StateSlice | IUserStore {
  const user = useUser();
  const [updateLocalUser, signoutLocalUser] = useLocalUserStore((store) => [
    store.updateLocalUser,
    store.signOutLocalUser,
  ]);
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: fireStoreUserDoc, update: updateFirestoreDoc } =
    useDocument<IUser>(authStoreUserId ? getUserPath(authStoreUserId) : null);

  const updateUser = (
    changes: Partial<IUser>,
    updateSyncedUser: boolean = true
  ) => {
    if (fireStoreUserDoc && updateSyncedUser) {
      // NB: when updating this list, also update firestore rules

      updateFirestoreDoc(getUpdatableUserProperties(changes));
    }
    updateLocalUser(removeUndefinedValues(changes));
  };

  const state: IUserStore = {
    user,
    resyncLocalStorage: (userData: IUser) => {
      updateUser(userData, false);
    },
    setNickname: (nickname: string) => {
      /*updateUser({
        nickname,
      });*/
      // FIXME: request nickname or store local if logged out
    },
    setLocale: (locale: string) => {
      updateUser({ locale });
    },
    markHasSeenWelcome: () => {
      updateUser({ hasSeenWelcome: true });
    },
    markHasSeenAllSet: () => {
      updateUser({ hasSeenAllSet: true });
    },
    setPreferredInputMethod: (
      preferredInputMethod: InputMethod | undefined
    ) => {
      updateUser({ preferredInputMethod });
    },
    addChallengeAttempt: (challengeId: string, attempt: IChallengeAttempt) => {
      // TODO: store locally, plus challenge attempt sync
      /*const attempts = user.challengeAttempts[challengeId] || [];
      updateUser({
        challengeAttempts: {
          ...user.challengeAttempts,
          [challengeId]: [...attempts, attempt],
        },
      });*/
    },
    completeChallenge: (challengeId: string) => {
      // TODO: remove this function, just use addChallengeAttempt
      /*const uniqueIds = new Set([...user.completedChallengeIds, challengeId]);
      updateUser({
        completedChallengeIds: Array.from(uniqueIds),
      });*/
    },
    updateControl: (inputAction: InputAction, control: string) => {
      updateUser({
        controls: { ...(user.controls! || {}), [inputAction]: control },
      });
    },
    resetControls: () => {
      updateUser({ controls: DEFAULT_KEYBOARD_CONTROLS });
    },
    clearProgress: () => {
      //updateUser({ completedChallengeIds: [], challengeAttempts: {} });
    },
    signOut: () => {
      signoutLocalUser();
      fuego.auth().signOut();
      useAuthStore.getState().setUser(undefined);
    },
    setAppTheme: (appTheme: AppTheme) => {
      updateUser({ appTheme });
    },
    setMusicOn: (musicOn: boolean) => {
      updateUser({ musicOn });
    },
  };

  return selector ? selector(state) : state;
}
