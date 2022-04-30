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
import removeUndefinedValues from '../utils/removeUndefinedValues';
import useAuthStore from './AuthStore';
import useLocalUserStore, { LocalUser } from './LocalUserStore';
import { getAuth, signOut as signOutAuthUser } from 'firebase/auth';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';

const updateFirestoreDoc = (userId: string, data: Partial<IUser>) =>
  updateDoc(doc(getFirestore(), getUserPath(userId)), data);

const updateLocalUser = (changes: Partial<LocalUser>) =>
  useLocalUserStore.getState().updateLocalUser(removeUndefinedValues(changes));

const updateUser = (
  changes: Partial<IUser>,
  updateSyncedUser: boolean = true
) => {
  if (updateSyncedUser) {
    const userId = useAuthStore.getState().user?.uid;
    if (userId) {
      console.log('update firestore user changes:', changes);
      updateFirestoreDoc(userId, removeUndefinedValues(changes));
    }
  }
  updateLocalUser(changes);
};

export const setLocalUserNickname = (nickname: string) => {
  updateLocalUser({ nickname });
};
export const purchaseFreeCharacter = (
  existingCharacterIds: string[],
  characterId: string
) => {
  updateLocalUser({
    freeCharacterIds: [...existingCharacterIds, characterId],
  });
};
export const setSelectedCharacterId = (selectedCharacterId: string) => {
  updateUser({
    selectedCharacterId,
  });
};

export const setUserLocale = (locale: string) => {
  updateUser({ locale });
};
export const markHasSeenWelcome = () => {
  updateUser({ hasSeenWelcome: true });
};
export const markHasSeenAllSet = () => {
  updateUser({ hasSeenAllSet: true });
};
export const setUserPreferredInputMethod = (
  preferredInputMethod: InputMethod | undefined
) => {
  updateUser({ preferredInputMethod });
};
export const addChallengeAttempt = (
  _challengeId: string,
  _attempt: IChallengeAttempt
) => {
  // TODO: store locally, plus challenge attempt sync
  /*const attempts = user.challengeAttempts[challengeId] || [];
  updateUser({
    challengeAttempts: {
      ...user.challengeAttempts,
      [challengeId]: [...attempts, attempt],
    },
  });*/
};
export const updateControl = (
  user: IUser,
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
};
export const resetControls = (inputMethod: AdjustableInputMethod) => {
  updateUser({ [`controls_${inputMethod}`]: DEFAULT_KEYBOARD_CONTROLS });
};
export const clearProgress = () => {
  //updateUser({ completedChallengeIds: [], challengeAttempts: {} });
};
export const signOut = () => {
  useLocalUserStore.getState().signOutLocalUser();
  signOutAuthUser(getAuth());
  useAuthStore.getState().setUser(null);
  setTimeout(() => (window.location.href = '/'), 500);
};
export const setUserAppTheme = (appTheme: AppTheme) => {
  updateUser({ appTheme });
};
export const setUserMusicOn = (musicOn: boolean) => {
  updateUser({ musicOn });
};
export const setUserSfxOn = (sfxOn: boolean) => {
  updateUser({ sfxOn });
};
export const setUserRendererQuality = (rendererQuality: RendererQuality) => {
  updateUser({ rendererQuality });
};
export const setUserRendererType = (rendererType: RendererType) => {
  updateUser({ rendererType });
};