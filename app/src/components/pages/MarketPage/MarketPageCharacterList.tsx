import FlexBox from '@/components/ui/FlexBox';
import { useMediaQuery } from '@mui/material';
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
import { useWindowSize } from 'react-use';
import { useCollection } from 'swr-firestore';
import { CharacterTile } from './MarketPageCharacterTile';

const cachedCharacters: Record<
  MarketPageCharacterListFilter,
  QueryDocumentSnapshot<ICharacter>[]
> = {
  'available-all': [],
  'available-free': [],
  'available-premium': [],
  'my-blocks': [],
};

export type MarketPageCharacterListFilter =
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
  const [loadMore, setLoadMore] = React.useState(
    cachedCharacters[filter].length === 0
  );
  const windowWidth = useWindowSize().width;
  const columns = Math.max(3, Math.min(8, Math.floor(windowWidth / 150)));
  const fetchLimit = columns * 4;
  const lastCharacter =
    cachedCharacters[filter][cachedCharacters[filter].length - 1];
  const gridGap = 0;
  const size = window.innerWidth / (columns * (columns > 3 ? 1.2 : 1.1));

  // TODO: useCollection purchases for my-blocks
  const { data: characters } = useCollection<ICharacter>(
    loadMore ? charactersPath : null,
    {
      constraints: [
        ...(filter === 'my-blocks'
          ? [where('id', 'in', [0])] // TODO: my ids
          : [
              ...(filter === 'available-free'
                ? [where('price', '<', 50)]
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
          (character) => filter === 'my-blocks' || character.id !== '0' // TODO: my ids
        )
      );
      console.log('Loaded', cachedCharacters[filter].length, 'characters');
      setLoadMore(false);
    }
  }, [characters, filter]);

  const onCharacterInView = React.useCallback(
    (index) => {
      if (index > cachedCharacters[filter].length - columns * 2) {
        setLoadMore(true);
      }
    },
    [setLoadMore, columns, filter]
  );

  return (
    <FlexBox
      width="100%"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      mt={0}
      gridGap={gridGap}
      minHeight={filter === 'my-blocks' ? '0' : '100vh'}
    >
      {cachedCharacters[filter].map((character, index) => (
        <Intersection
          key={character.id}
          width={size}
          height={size + 50 + size * 0.1}
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
