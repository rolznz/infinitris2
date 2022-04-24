import useAuthStore from '@/state/AuthStore';
import useLocalUserStore from '@/state/LocalUserStore';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import {
  Creatable,
  getNicknamePath,
  getUserPath,
  INickname,
  IUser,
} from 'infinitris2-models';
import React from 'react';
//import { toast } from 'react-toastify';
import { useDocument } from 'swr-firestore';

export function useSyncUserProfile() {
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const { data: user } = useDocument<IUser>(
    authStoreUserId ? getUserPath(authStoreUserId) : null
  );
  const localUser = useLocalUserStore((store) => store.user);
  const localUserNickname = localUser.nickname;
  const userExists = !!user;
  const userNickname = user?.data()?.readOnly.nickname;

  //let syncingUser = false;
  React.useEffect(() => {
    if (
      authStoreUserId &&
      userExists &&
      localUserNickname &&
      userNickname !== localUserNickname
    ) {
      //toast('Syncing nickname...');
      (async () => {
        try {
          const nicknamePath = getNicknamePath(localUserNickname);
          const nickname: Creatable<INickname> = {
            created: false,
            userId: authStoreUserId,
          };
          await setDoc(doc(getFirestore(), nicknamePath), nickname);
        } catch (error) {
          console.error('Failed to create nickname', error);
          //alert('Failed to sync nickname');
        }
      })();
    }
  }, [authStoreUserId, userExists, userNickname, localUserNickname]);
}
