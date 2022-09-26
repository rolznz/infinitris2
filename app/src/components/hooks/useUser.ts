import { useDocument, UseDocumentOptions } from 'swr-firestore';
import {
  DEFAULT_KEYBOARD_CONTROLS,
  getUserPath,
  IUser,
  LaunchOptions,
} from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import useLocalUserStore, {
  LocalUser,
  LocalUserWithoutUserProps,
} from '../../state/LocalUserStore';
import React from 'react';
import { DocumentSnapshot } from 'firebase/firestore';

type CombinedUser = LocalUserWithoutUserProps & IUser & { id?: string };

const useFirestoreDocOptions: UseDocumentOptions = {
  listen: true,
};

let cachedCombinedUser: CombinedUser;
let cachedUser: DocumentSnapshot<IUser> | undefined;
let cachedLocalUser: LocalUser;
export function useUser(): CombinedUser {
  const localUser = useLocalUserStore(
    (store) => store.user
  ) as LocalUserWithoutUserProps;
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: user } = useDocument<IUser>(
    authStoreUserId ? getUserPath(authStoreUserId) : null,
    useFirestoreDocOptions
  );

  let combinedUser: CombinedUser = cachedCombinedUser;
  if (!combinedUser || cachedLocalUser !== localUser || user !== cachedUser) {
    combinedUser = {
      ...localUser,
      id: user?.id,
      ...(user?.data() || ({} as IUser)),
    };
    console.log(
      'User changed',
      user === cachedUser,
      localUser === cachedLocalUser
    );
    cachedCombinedUser = combinedUser;
    cachedUser = user;
    cachedLocalUser = localUser;
  }

  return combinedUser;
}

type UseUserLaunchOptionsType = Pick<
  LaunchOptions,
  | 'rendererSettings'
  | 'useCustomRepeat'
  | 'customRepeatInitialDelay'
  | 'customRepeatRate'
  | 'allowRepeatedRotations'
  | 'controls_keyboard'
  | 'controls_gamepad'
  | 'showUI'
>;

export function useUserLaunchOptions(
  user: CombinedUser
): UseUserLaunchOptionsType {
  const {
    rendererQuality,
    rendererType,
    gridLineType,
    blockShadowType,
    showFaces,
    showPatterns,
    showNicknames,
    controls_keyboard,
    controls_gamepad,
    useCustomRepeat,
    customRepeatInitialDelay,
    customRepeatRate,
    showUI,
    allowRepeatedRotations,
  } = user;

  const launchOptions = React.useMemo(() => {
    const settings: UseUserLaunchOptionsType = {
      rendererSettings: {
        rendererQuality,
        rendererType,
        gridLineType,
        blockShadowType,
        showFaces,
        showPatterns,
        showNicknames,
      },
      controls_keyboard: {
        ...DEFAULT_KEYBOARD_CONTROLS,
        ...(controls_keyboard || {}),
      },
      controls_gamepad,
      allowRepeatedRotations,
      useCustomRepeat,
      customRepeatInitialDelay,
      customRepeatRate,
      showUI,
    };
    return settings;
  }, [
    blockShadowType,
    gridLineType,
    rendererQuality,
    rendererType,
    showFaces,
    showNicknames,
    showPatterns,
    showUI,
    controls_keyboard,
    controls_gamepad,
    useCustomRepeat,
    customRepeatInitialDelay,
    customRepeatRate,
    allowRepeatedRotations,
  ]);
  return launchOptions;
}
