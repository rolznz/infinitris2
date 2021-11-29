import FlexBox from '@/components/ui/FlexBox';
import { useMediaQuery } from '@material-ui/core';
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
import { useCollection } from 'swr-firestore';
import { CharacterTile } from './MarketPageCharacterTile';

const cachedCharacters: Record<
  MarketPageCharacterListFilter,
  QueryDocumentSnapshot<ICharacter>[]
> = {
  available: [],
  'my-blocks': [],
};

type MarketPageCharacterListFilter = 'available' | 'my-blocks';

type MarketPageCharacterListProps = {
  filter: MarketPageCharacterListFilter;
};

export function MarketPageCharacterList({
  filter,
}: MarketPageCharacterListProps) {
  const [loadMore, setLoadMore] = React.useState(
    cachedCharacters[filter].length === 0
  );
  const isMobile = useMediaQuery('(max-width:600px)');
  const columns = isMobile ? 3 : 5;
  const fetchLimit = columns * 4;
  const lastCharacter =
    cachedCharacters[filter][cachedCharacters[filter].length - 1];
  const gridGap = 5;
  const size = window.innerWidth / columns - gridGap * columns;

  // TODO: useCollection purchases for my-blocks
  const { data: characters } = useCollection<ICharacter>(
    loadMore ? charactersPath : null,
    {
      constraints: [
        ...(filter === 'my-blocks'
          ? [where('id', 'in', [0])]
          : [orderBy('price')]),
        ...(lastCharacter ? [startAfter(lastCharacter)] : []),
        limit(fetchLimit),
      ],
    }
  );

  React.useEffect(() => {
    if (characters?.length) {
      cachedCharacters[filter] = cachedCharacters[filter].concat(characters);
      console.log('Loaded', cachedCharacters[filter].length, 'characters');
      setLoadMore(false);
    }
  }, [characters, filter]);

  return (
    <FlexBox
      width="100%"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent="flex-start"
      mt={0}
      gridGap={gridGap}
    >
      {cachedCharacters[filter].map((character, index) => (
        <Intersection
          key={character.id}
          width={size}
          height={size + gridGap * 10}
          onInView={() => {
            if (index > cachedCharacters[filter].length - columns * 2) {
              setLoadMore(true);
            }
          }}
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
  onInView,
}: React.PropsWithChildren<{
  width: number;
  height: number;
  onInView: () => void;
}>) => {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '500px' });
  React.useEffect(() => {
    if (inView) {
      onInView();
    }
  }, [inView, onInView]);

  return (
    <div ref={ref} style={{ width, height, overflow: 'hidden' }}>
      {inView && children}
    </div>
  );
};

const Intersection = React.memo(_Intersection, () => true);
