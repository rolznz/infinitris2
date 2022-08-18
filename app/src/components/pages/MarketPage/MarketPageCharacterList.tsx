import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_CHARACTER_IDs,
  LocalUser,
} from '@/state/LocalUserStore';
import { useUser } from '@/components/hooks/useUser';
import {
  QueryDocumentSnapshot,
  orderBy,
  where,
  DocumentSnapshot,
} from 'firebase/firestore';
import { ICharacter, charactersPath } from 'infinitris2-models';
import React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import { UseCollectionOptions } from 'swr-firestore';
import { CharacterTile } from './MarketPageCharacterTile';
import useAuthStore from '@/state/AuthStore';
import { InfiniteLoader } from '@/components/ui/InfiniteLoader';

const cachedCharacters: Record<
  MarketPageCharacterListFilter,
  QueryDocumentSnapshot<ICharacter>[]
> = {
  'available-all': [],
  'available-free': [],
  'available-premium': [],
  'available-featured': [],
  'my-blocks': [],
};

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
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);

  const [characters, setCharacters] = React.useState<
    QueryDocumentSnapshot<ICharacter>[]
  >(cachedCharacters[filter]);
  const windowWidth = useWindowSize().width;
  const columns = Math.max(3, Math.min(8, Math.floor(windowWidth / 150)));

  const size = window.innerWidth / (columns * (columns > 3 ? 1.2 : 1.1));

  const user = useUser();
  const myCharacterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const myCharacterIds = React.useMemo(
    () =>
      (!authStoreUserId
        ? (user as LocalUser).freeCharacterIds || []
        : user.readOnly?.characterIds || []
      ).concat(DEFAULT_CHARACTER_IDs),
    [user, authStoreUserId]
  );

  const useCharactersOptions: UseCollectionOptions = React.useMemo(
    () => ({
      constraints: [
        ...(filter === 'my-blocks'
          ? [
              where(
                'id',
                'in',
                myCharacterIds.map((id) => parseInt(id))
              ),
            ] // TODO: my ids FIXME: character ID should be a string everywhere
          : [
              ...(filter === 'available-free'
                ? [where('price', '==', 0)]
                : filter === 'available-featured'
                ? [where('isFeatured', '==', true), orderBy('price')]
                : filter === 'available-premium'
                ? [where('price', '>', 400)]
                : [orderBy('price')]),
            ]),
      ],
    }),
    [filter, myCharacterIds]
  );

  const onNewItemsLoaded = React.useCallback(
    (newItems: QueryDocumentSnapshot<ICharacter>[]) => {
      cachedCharacters[filter] = cachedCharacters[filter].concat(
        newItems.filter(
          (character) =>
            filter === 'my-blocks' || myCharacterIds.indexOf(character.id) < 0
        )
      );
      setCharacters(cachedCharacters[filter]);
      console.log('Loaded', cachedCharacters[filter].length, 'characters');
    },
    [filter, myCharacterIds]
  );

  const characterBlockHeight = size + 50 + size * 0.1;

  const renderItem = React.useCallback<
    (character: DocumentSnapshot<ICharacter>) => React.ReactNode
  >(
    (character) => {
      return (
        <CharacterTile
          character={character}
          size={size}
          isPurchased={filter === 'my-blocks'}
          isSelected={character.id === myCharacterId}
        />
      );
    },
    [filter, myCharacterId, size]
  );

  return (
    <InfiniteLoader<ICharacter>
      items={characters}
      onNewItemsLoaded={onNewItemsLoaded}
      itemKey={(item) => item.id + '-' + (item.id === myCharacterId)}
      renderItem={renderItem}
      minHeight={filter === 'my-blocks' ? characterBlockHeight : '100vh'}
      itemWidth={size}
      itemHeight={characterBlockHeight}
      numColumns={columns}
      collectionPath={charactersPath}
      useCollectionOptions={useCharactersOptions}
    />
  );
}
