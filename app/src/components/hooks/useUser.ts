import { useDocument, UseDocumentOptions } from 'swr-firestore';
import { getUserPath, IUser, RendererSettings } from 'infinitris2-models';
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

export function useUserRendererSettings(user: CombinedUser): RendererSettings {
  const {
    rendererQuality,
    rendererType,
    gridLineType,
    blockShadowType,
    showFaces,
    showPatterns,
    showNicknames,
  } = user;

  const rendererSettings: RendererSettings = React.useMemo(
    () => ({
      rendererQuality,
      rendererType,
      gridLineType,
      blockShadowType,
      showFaces,
      showPatterns,
      showNicknames,
    }),
    [
      blockShadowType,
      gridLineType,
      rendererQuality,
      rendererType,
      showFaces,
      showNicknames,
      showPatterns,
    ]
  );
  return rendererSettings;
}
