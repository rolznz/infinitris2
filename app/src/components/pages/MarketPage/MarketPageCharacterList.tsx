import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_CHARACTER_IDs,
  LocalUser,
} from '@/state/LocalUserStore';
import { useUser } from '@/components/hooks/useUser';
import { ICharacter, charactersPath, WithId } from 'infinitris2-models';
import React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import { CharacterTile } from './MarketPageCharacterTile';
import useAuthStore from '@/state/AuthStore';
import { useCachedCollection } from '@/components/hooks/useCachedCollection';
import { CachedInfiniteLoader } from '@/components/ui/CachedInfiniteLoader';

export type MarketPageCharacterListFilter =
  | 'available-featured'
  | 'available-all'
  | 'available-free'
  | 'available-premium'
  | 'my-blocks';

type MarketPageCharacterListProps = {
  filter: MarketPageCharacterListFilter;
};

export function MarketPageCharacterList({
  filter,
}: MarketPageCharacterListProps) {
  const allCharacters = useCachedCollection<ICharacter>(charactersPath);
  const user = useUser();
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const myCharacterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const myCharacterIds = React.useMemo(
    () =>
      (!authStoreUserId
        ? (user as LocalUser).freeCharacterIds || []
        : user.readOnly?.characterIds || []
      ).concat(DEFAULT_CHARACTER_IDs),
    [user, authStoreUserId]
  );

  const characters = React.useMemo(() => {
    const _characters = allCharacters?.filter((character) =>
      filter === 'available-free'
        ? character.price === 0
        : filter === 'available-featured'
        ? character.isFeatured === true
        : filter === 'available-premium'
        ? character.price > 400
        : filter === 'my-blocks'
        ? myCharacterIds.indexOf(character.id) > -1
        : true
    );
    _characters?.sort((a, b) => a.price - b.price);
    return _characters;
  }, [allCharacters, filter, myCharacterIds]);
  const windowWidth = useWindowSize().width;
  const columns = Math.max(3, Math.min(8, Math.floor(windowWidth / 150)));

  const size = window.innerWidth / (columns * (columns > 3 ? 1.2 : 1.1));

  const characterBlockHeight = size + 50 + size * 0.1;

  const renderItem = React.useCallback<
    (character: WithId<ICharacter>) => React.ReactNode
  >(
    (character) => {
      return (
        <CharacterTile
          character={character}
          size={size}
          isPurchased={myCharacterIds.indexOf(character.id) > -1}
          isSelected={character.id === myCharacterId}
        />
      );
    },
    [myCharacterId, myCharacterIds, size]
  );

  return characters ? (
    <CachedInfiniteLoader<WithId<ICharacter>>
      items={characters}
      renderItem={renderItem}
      minHeight={'100vh'}
      itemWidth={size}
      itemHeight={characterBlockHeight}
      key={myCharacterId}
    />
  ) : null;
}
