import FlexBox from '@/components/ui/FlexBox';
import { LocalUser } from '@/state/LocalUserStore';
import { useUser } from '@/state/UserStore';
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
import { useCollection } from 'swr-firestore';
import { CharacterTile } from './MarketPageCharacterTile';

const cachedCharacters: Record<
  MarketPageCharacterListFilter,
  QueryDocumentSnapshot<ICharacter>[]
> = {
  'available-all': [],
  'available-affordable': [],
  'available-premium': [],
  'available-featured': [],
  'my-blocks': [],
};

export type MarketPageCharacterListFilter =
  | 'available-featured'
  | 'available-all'
  | 'available-affordable'
  | 'available-premium'
  | 'my-blocks';

type MarketPageCharacterListProps = {
  filter: MarketPageCharacterListFilter;
};

export function MarketPageCharacterList({
  filter,
}: MarketPageCharacterListProps) {
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
  const characterId = (user as LocalUser).characterId;
  const myIds = React.useMemo(() => [characterId], [characterId]);

  // TODO: useCollection purchases for my-blocks
  const { data: characters } = useCollection<ICharacter>(
    loadMore ? charactersPath : null,
    {
      constraints: [
        ...(filter === 'my-blocks'
          ? [
              where(
                'id',
                'in',
                myIds.map((id) => parseInt(id))
              ),
            ] // TODO: my ids FIXME: character ID should be a string everywhere
          : [
              ...(filter === 'available-affordable'
                ? [where('price', '<', 50), orderBy('price')]
                : filter === 'available-featured'
                ? [where('isFeatured', '==', true), orderBy('price')]
                : filter === 'available-premium'
                ? [where('price', '>', 400)]
                : [orderBy('price')]),
            ]),
        ...(lastCharacter ? [startAfter(lastCharacter)] : []),
        limit(fetchLimit),
      ],
    }
  );

  React.useEffect(() => {
    if (characters?.length) {
      cachedCharacters[filter] = cachedCharacters[filter].concat(
        characters.filter(
          (character) =>
            filter === 'my-blocks' || myIds.indexOf(character.id) < 0
        )
      );
      console.log('Loaded', cachedCharacters[filter].length, 'characters');
      setLoadMore(false);
    }
  }, [characters, filter, myIds]);

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
          key={character.id}
          width={size}
          height={characterBlockHeight}
          index={index}
          onInView={onCharacterInView}
        >
          <CharacterTile character={character} size={size} />
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
