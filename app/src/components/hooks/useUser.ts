import { useDocument, UseDocumentOptions } from 'swr-firestore';
import { getUserPath, IUser } from 'infinitris2-models';
import useAuthStore from '../../state/AuthStore';
import useLocalUserStore, {
  LocalUserWithoutUserProps,
} from '../../state/LocalUserStore';

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
