import { useDocument, UseDocumentOptions } from 'swr-firestore';
import { getUserPath, IUser, LaunchOptions } from 'infinitris2-models';
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
  if (!combinedUser || localUser !== cachedLocalUser || cachedUser !== user) {
    combinedUser = {
      ...localUser,
      id: user?.id,
      ...(user?.data() || ({} as IUser)),
    };
    cachedCombinedUser = combinedUser;
    cachedUser = user;
    cachedLocalUser = localUser;
    console.log(
      'User changed',
      user === cachedUser,
      localUser === cachedLocalUser
    );
  }

  return combinedUser;
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
