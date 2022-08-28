import { useCachedCollection } from '@/components/hooks/useCachedCollection';
import { useUser } from '@/components/hooks/useUser';
import useAuthStore from '@/state/AuthStore';
import { LocalUser, DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import {
  charactersPath,
  ICharacter,
  NetworkPlayerInfo,
  stringToHex,
} from 'infinitris2-models';

export function useNetworkPlayerInfo(): Partial<NetworkPlayerInfo> | undefined {
  const isLoggedIn = useAuthStore((store) => store.isLoggedIn);
  const user = useUser();
  const nickname = user.readOnly?.nickname || (user as LocalUser).nickname;
  const characterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const character = useCachedCollection<ICharacter>(charactersPath)?.find(
    (c) => c.id === characterId
  );

  if (!character || (isLoggedIn && !user?.id)) {
    return undefined;
  }

  return {
    nickname,
    color:
      character?.color !== undefined ? stringToHex(character.color) : undefined,
    patternFilename: character?.patternFilename,
    characterId,
    isPremium: isLoggedIn,
    isNicknameVerified: !!user.readOnly?.nickname?.length,
  };
}
