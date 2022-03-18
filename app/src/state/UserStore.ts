import { useDocument } from 'swr-firestore';
import {
  DEFAULT_KEYBOARD_CONTROLS,
  getUserPath,
  IChallengeAttempt,
  InputAction,
  InputMethod,
  AdjustableInputMethod,
  IUser,
  AppTheme,
  RendererQuality,
  RendererType,
  ControlSettings,
} from 'infinitris2-models';
import { StateSelector } from 'zustand';
import removeUndefinedValues from '../utils/removeUndefinedValues';
import useAuthStore from './AuthStore';
import useLocalUserStore, { LocalUser } from './LocalUserStore';
import { getAuth, signOut } from 'firebase/auth';
import shallow from 'zustand/shallow';

export function useUser(): (IUser | LocalUser) & { id?: string } {
  const localUser = useLocalUserStore((store) => store.user);
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: user } = useDocument<IUser>(
    authStoreUserId ? getUserPath(authStoreUserId) : null
  );
  return {
    ...localUser,
    id: user?.id,
    ...(user?.data() || {}),
  };
}

type IUserStore = {
  readonly user: IUser;
  setNickname(nickname: string): void;
  setCharacterId(characterId: string): void;
  setLocale(locale: string): void;
  markHasSeenWelcome(): void;
  markHasSeenAllSet(): void;
  setPreferredInputMethod(preferredInputMethod: InputMethod | undefined): void;
  addChallengeAttempt(challengeId: string, attempt: IChallengeAttempt): void;
  completeChallenge(challengeId: string): void;
  updateControl(
    inputMethod: AdjustableInputMethod,
    inputAction: InputAction,
    control: string
  ): void;
  resetControls(inputMethod: AdjustableInputMethod): void;
  clearProgress(): void;
  signOut(): void;
  resyncLocalStorage(userData: IUser): void;
  setAppTheme(appTheme: AppTheme): void;
  setMusicOn(musicOn: boolean): void;
  setSfxOn(sfxOn: boolean): void;
  setRendererQuality(rendererQuality: RendererQuality): void;
  setRendererType(rendererType: RendererType): void;
};

export function getUpdatableUserProperties(
  user: Partial<IUser>
): Partial<IUser> {
  return {
    //nickname: user.nickname,
    //challengeAttempts: user.challengeAttempts,
    //completedChallengeIds: user.completedChallengeIds,
    controls_keyboard: user.controls_keyboard,
    controls_gamepad: user.controls_gamepad,
    hasSeenAllSet: user.hasSeenAllSet,
    hasSeenWelcome: user.hasSeenWelcome,
    preferredInputMethod: user.preferredInputMethod,
    locale: user.locale,
  };
}

export function useUserStore(): IUserStore;
/*useUserStore.getState = {

}*/
export function useUserStore<StateSlice>(
  selector: StateSelector<IUserStore, StateSlice>
): StateSlice;
export function useUserStore<StateSlice>(
  selector?: StateSelector<IUserStore, StateSlice>
): StateSlice | IUserStore {
  const user = useUser();
  const [updateLocalUser, signoutLocalUser] = useLocalUserStore(
    (store) => [store.updateLocalUser, store.signOutLocalUser],
    shallow
  );
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: fireStoreUserDoc /*, update: updateFirestoreDoc*/ } =
    useDocument<IUser>(authStoreUserId ? getUserPath(authStoreUserId) : null);

  const updateUser = (
    changes: Partial<IUser>,
    updateSyncedUser: boolean = true
  ) => {
    if (fireStoreUserDoc && updateSyncedUser) {
      // NB: when updating this list, also update firestore rules
      // FIXME: update user
      //updateFirestoreDoc(getUpdatableUserProperties(changes));
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
      updateLocalUser({ nickname });
    },
    setCharacterId: (characterId: string) => {
      /*updateUser({
        nickname,
      });*/
      updateLocalUser({ characterId });
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
    updateControl: (
      inputMethod: AdjustableInputMethod,
      inputAction: InputAction,
      control: string
    ) => {
      updateUser({
        [`controls_${inputMethod}`]: {
          ...((user[`controls_${inputMethod}`] as ControlSettings) || {}),
          [inputAction]: control,
        },
      });
    },
    resetControls: (inputMethod: AdjustableInputMethod) => {
      updateUser({ [`controls_${inputMethod}`]: DEFAULT_KEYBOARD_CONTROLS });
    },
    clearProgress: () => {
      //updateUser({ completedChallengeIds: [], challengeAttempts: {} });
    },
    signOut: () => {
      signoutLocalUser();
      signOut(getAuth());
      useAuthStore.getState().setUser(null);
    },
    setAppTheme: (appTheme: AppTheme) => {
      updateUser({ appTheme });
    },
    setMusicOn: (musicOn: boolean) => {
      updateUser({ musicOn });
    },
    setSfxOn: (sfxOn: boolean) => {
      updateUser({ sfxOn });
    },
    setRendererQuality: (rendererQuality: RendererQuality) => {
      updateUser({ rendererQuality });
    },
    setRendererType: (rendererType: RendererType) => {
      updateUser({ rendererType });
    },
  };

  return selector ? selector(state) : state;
}
