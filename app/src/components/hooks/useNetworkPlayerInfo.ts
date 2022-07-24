import { useUser } from '@/components/hooks/useUser';
import useAuthStore from '@/state/AuthStore';
import { LocalUser, DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import {
  getCharacterPath,
  ICharacter,
  NetworkPlayerInfo,
  stringToHex,
} from 'infinitris2-models';
import { useDocument } from 'swr-firestore';

export function useNetworkPlayerInfo(): Partial<NetworkPlayerInfo> | undefined {
  const isLoggedIn = useAuthStore((store) => store.isLoggedIn);
  const user = useUser();
  const nickname = user.readOnly?.nickname || (user as LocalUser).nickname;
  const characterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const { data: character } = useDocument<ICharacter>(
    getCharacterPath(characterId)
  );

  if (!character || (isLoggedIn && !user?.id)) {
    return undefined;
  }

  return {
    nickname,
    color:
      character.data()?.color !== undefined
        ? stringToHex(character?.data()?.color!)
        : undefined,
    patternFilename: character.data()?.patternFilename,
    characterId,
    isPremium: isLoggedIn,
    isNicknameVerified: !!user.readOnly?.nickname?.length,
  };
}
