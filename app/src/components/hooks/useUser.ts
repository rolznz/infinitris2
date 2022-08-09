import { useDocument, UseDocumentOptions } from 'swr-firestore';
import { getUserPath, IUser, LaunchOptions } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import useLocalUserStore, {
  LocalUserWithoutUserProps,
} from '../../state/LocalUserStore';
import React from 'react';

type CombinedUser = LocalUserWithoutUserProps & IUser & { id?: string };

const useFirestoreDocOptions: UseDocumentOptions = {
  listen: true,
};

export function useUser(): CombinedUser {
  const localUser = useLocalUserStore(
    (store) => store.user
  ) as LocalUserWithoutUserProps;
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: user } = useDocument<IUser>(
    authStoreUserId ? getUserPath(authStoreUserId) : null,
    useFirestoreDocOptions
  );
  return {
    ...localUser,
    id: user?.id,
    ...(user?.data() || ({} as IUser)),
  };
}

export function useUserLaunchOptions(
  user: CombinedUser
): Pick<
  LaunchOptions,
  | 'rendererSettings'
  | 'useCustomRepeat'
  | 'customRepeatInitialDelay'
  | 'customRepeatRate'
> {
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
  } = user;

  const launchOptions = React.useMemo(
    () => ({
      rendererSettings: {
        rendererQuality,
        rendererType,
        gridLineType,
        blockShadowType,
        showFaces,
        showPatterns,
        showNicknames,
      },
      controls_keyboard,
      controls_gamepad,
      useCustomRepeat,
      customRepeatInitialDelay,
      customRepeatRate,
    }),
    [
      blockShadowType,
      gridLineType,
      rendererQuality,
      rendererType,
      showFaces,
      showNicknames,
      showPatterns,
      controls_keyboard,
      controls_gamepad,
      useCustomRepeat,
      customRepeatInitialDelay,
      customRepeatRate,
    ]
  );
  return launchOptions;
}
