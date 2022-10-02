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
import { useCachedCollection } from '@/components/hooks/useCachedCollection';
import FlexBox from '@/components/ui/FlexBox';

const cachedCharacters: Record<
  MarketPageCharacterListFilter,
  QueryDocumentSnapshot<ICharacter>[]
> = {
  'available-all': [],
  'available-free': [],
  'available-premium': [],
  'available-featured': [],
};

export type MarketPageCharacterListFilter =
  | 'available-featured'
  | 'available-all'
  | 'available-free'
  | 'available-premium';

type MarketPageCharacterListProps = {
  filter: MarketPageCharacterListFilter;
};

export function MarketPageCharacterList({
  filter,
}: MarketPageCharacterListProps) {
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);

  // TODO: remove useCollection in infinite loader since all characters are loaded at startup
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
        ...[
          ...(filter === 'available-free'
            ? [where('price', '==', 0)]
            : filter === 'available-featured'
            ? [where('isFeatured', '==', true), orderBy('price')]
            : filter === 'available-premium'
            ? [where('price', '>', 400)]
            : [orderBy('price')]),
        ],
      ],
    }),
    [filter]
  );

  const onNewItemsLoaded = React.useCallback(
    (newItems: QueryDocumentSnapshot<ICharacter>[]) => {
      cachedCharacters[filter] = cachedCharacters[filter].concat(
        newItems.filter((character) => myCharacterIds.indexOf(character.id) < 0)
      );
      setCharacters(cachedCharacters[filter]);
      console.log('Loaded', cachedCharacters[filter].length, 'characters');
    },
    [filter, myCharacterIds]
  );

  const characterBlockHeight = size + 50 + size * 0.1;

  // FIXME: remove weird character cast (see TODO to use cached characters)
  const renderItem = React.useCallback<
    (character: DocumentSnapshot<ICharacter>) => React.ReactNode
  >(
    (character) => {
      return (
        <CharacterTile
          character={{
            ...(character.data() as ICharacter),
            id: character.id as never,
          }}
          size={size}
          isPurchased={myCharacterIds.indexOf(character.id) > -1}
          isSelected={character.id === myCharacterId}
        />
      );
    },
    [myCharacterId, myCharacterIds, size]
  );

  return (
    <InfiniteLoader<ICharacter>
      items={characters}
      onNewItemsLoaded={onNewItemsLoaded}
      itemKey={(item) => item.id + '-' + (item.id === myCharacterId)}
      renderItem={renderItem}
      minHeight={'100vh'}
      itemWidth={size}
      itemHeight={characterBlockHeight}
      numColumns={columns}
      collectionPath={charactersPath}
      useCollectionOptions={useCharactersOptions}
    />
  );
}

export function MarketPagePurchasedCharacterList() {
  const user = useUser();
  const authStoreUserId = useAuthStore((authStore) => authStore.user?.uid);
  const allCharacters = useCachedCollection<ICharacter>(charactersPath);
  const myCharacterId = user.selectedCharacterId || DEFAULT_CHARACTER_ID;
  const myCharacterIds = React.useMemo(
    () =>
      (!authStoreUserId
        ? (user as LocalUser).freeCharacterIds || []
        : user.readOnly?.characterIds || []
      ).concat(DEFAULT_CHARACTER_IDs),
    [user, authStoreUserId]
  );
  const myCharacters = React.useMemo(
    () =>
      allCharacters?.filter((c) => myCharacterIds.some((id) => c.id === id)),
    [allCharacters, myCharacterIds]
  );
  const size = 150;
  return (
    <FlexBox
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      key={myCharacterId}
    >
      {myCharacters?.map((character) => (
        <CharacterTile
          key={character.id}
          character={character}
          size={size}
          isPurchased={true}
          isSelected={character.id === myCharacterId}
        />
      ))}
    </FlexBox>
  );
}
