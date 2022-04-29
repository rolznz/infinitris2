import FlexBox from '@/components/ui/FlexBox';
import {
  DEFAULT_CHARACTER_ID,
  DEFAULT_CHARACTER_IDs,
  LocalUser,
} from '@/state/LocalUserStore';
import { useUser } from '@/components/hooks/useUser';
import {
  QueryDocumentSnapshot,
  orderBy,
  startAfter,
  limit,
  where,
} from 'firebase/firestore';
import { ICharacter, charactersPath } from 'infinitris2-models';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { CharacterTile } from './MarketPageCharacterTile';
import useAuthStore from '@/state/AuthStore';

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
  const [loadMore, setLoadMore] = React.useState(
    cachedCharacters[filter].length === 0
  );
  const windowWidth = useWindowSize().width;
  const columns = Math.max(3, Math.min(8, Math.floor(windowWidth / 150)));
  const fetchLimit = columns * 4;
  const lastCharacter =
    cachedCharacters[filter][cachedCharacters[filter].length - 1];
  const size = window.innerWidth / (columns * (columns > 3 ? 1.2 : 1.1));

  const user = useUser();
  const myCharacterId =
    (user as LocalUser).selectedCharacterId || DEFAULT_CHARACTER_ID;
  const myCharacterIds = React.useMemo(
    () =>
      !authStoreUserId
        ? (user as LocalUser).freeCharacterIds || DEFAULT_CHARACTER_IDs
        : user.readOnly?.characterIds || DEFAULT_CHARACTER_IDs,
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
        ...(lastCharacter ? [startAfter(lastCharacter)] : []),
        limit(fetchLimit),
      ],
    }),
    [fetchLimit, filter, lastCharacter, myCharacterIds]
  );

  // TODO: useCollection purchases for my-blocks
  const { data: characters } = useCollection<ICharacter>(
    loadMore ? charactersPath : null,
    useCharactersOptions
  );

  React.useEffect(() => {
    if (characters?.length) {
      cachedCharacters[filter] = cachedCharacters[filter].concat(
        characters.filter(
          (character) =>
            filter === 'my-blocks' || myCharacterIds.indexOf(character.id) < 0
        )
      );
      console.log('Loaded', cachedCharacters[filter].length, 'characters');
      setLoadMore(false);
    }
  }, [characters, filter, myCharacterIds]);

  const onCharacterInView = React.useCallback(
    (index) => {
      if (index > cachedCharacters[filter].length - columns * 2) {
        setLoadMore(true);
      }
    },
    [setLoadMore, columns, filter]
  );

  const characterBlockHeight = size + 50 + size * 0.1;

  return (
    <FlexBox
      width="100%"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      alignItems="flex-start"
      mt={0}
      minHeight={filter === 'my-blocks' ? characterBlockHeight : '100vh'}
    >
      {cachedCharacters[filter].map((character, index) => (
        <Intersection
          key={character.id + '-' + (character.id === myCharacterId)}
          width={size}
          height={characterBlockHeight}
          index={index}
          onInView={onCharacterInView}
        >
          <CharacterTile
            character={character}
            size={size}
            isPurchased={filter === 'my-blocks'}
            isSelected={character.id === myCharacterId}
          />
        </Intersection>
      ))}
    </FlexBox>
  );
}

const _Intersection = ({
  children,
  width,
  height,
  index,
  onInView,
}: React.PropsWithChildren<{
  width: number;
  height: number;
  index: number;
  onInView: (index: number) => void;
}>) => {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '500px' });
  React.useEffect(() => {
    if (inView) {
      onInView(index);
    }
  }, [inView, onInView, index]);

  const style = React.useMemo(
    () => ({ width, height, overflow: 'hidden' }),
    [width, height]
  );

  return (
    <div ref={ref} style={style}>
      {inView && children}
    </div>
  );
};

const Intersection = React.memo(_Intersection, () => true);
