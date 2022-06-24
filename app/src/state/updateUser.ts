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
  Creatable,
  INickname,
  getNicknamePath,
  getPurchasePath,
  IPurchase,
  UnlockableFeature,
} from 'infinitris2-models';
import removeUndefinedValues from '../utils/removeUndefinedValues';
import useAuthStore from './AuthStore';
import useLocalUserStore, { LocalUser } from './LocalUserStore';
import { getAuth, signOut as signOutAuthUser } from 'firebase/auth';
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

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

const setLocalUserNickname = (nickname: string) => {
  updateLocalUser({ nickname });
};

export async function setNickname(nicknameId: string): Promise<boolean> {
  const userId = useAuthStore.getState().user?.uid;
  if (!userId) {
    setLocalUserNickname(nicknameId);
    return true;
  }
  try {
    const nickname: Creatable<INickname> = {
      created: false,
      userId,
    };
    await setDoc(doc(getFirestore(), getNicknamePath(nicknameId)), nickname);
    return true;
  } catch (error) {
    console.error('Failed to create nickname', error);
    //alert('Failed to sync nickname');
    return false;
  }
}

export async function purchaseCharacter(characterId: string): Promise<boolean> {
  const authStoreUserId = useAuthStore.getState().user?.uid;
  if (!authStoreUserId) {
    return false;
  }
  const purchase: Creatable<IPurchase> = {
    created: false,
    entityCollectionPath: 'characters',
    entityId: characterId,
    userId: authStoreUserId,
  };
  try {
    await setDoc(
      doc(
        getFirestore(),
        getPurchasePath('characters', characterId, authStoreUserId)
      ),
      purchase
    );
    return true;
  } catch (error) {
    console.error('Failed to purchase character', error);
    return false;
  }
}

export const localPurchaseFreeCharacter = (
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
export const setUserPreferredInputMethod = (
  preferredInputMethod: InputMethod | undefined
) => {
  updateUser({ preferredInputMethod });
};

export const unlockFeature = (
  unlockedFeatures: UnlockableFeature[] | undefined,
  ...feature: UnlockableFeature[]
) => {
  updateUser({
    unlockedFeatures: [...(unlockedFeatures || []), ...feature].filter(
      (v, i, a) => a.indexOf(v) === i
    ),
  });
};
export const completeOfficialChallenge = (
  completedOfficialChallengeIds: string[] | undefined,
  challengeId: string
) => {
  updateUser({
    completedOfficialChallengeIds: [
      ...(completedOfficialChallengeIds || []),
      challengeId,
    ].filter((v, i, a) => a.indexOf(v) === i),
  });
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
  updateUser({ unlockedFeatures: [], completedOfficialChallengeIds: [] });
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
