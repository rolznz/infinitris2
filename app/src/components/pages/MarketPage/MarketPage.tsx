import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { useIntl } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection } from 'swr-firestore';
import { Page } from '../../ui/Page';
import { CharacterTile } from './MarketPageCharacterTile';
import marketImage from './assets/market.png';
import { useInView } from 'react-intersection-observer';
import { useMediaQuery } from '@material-ui/core';
import {
  limit,
  orderBy,
  QueryDocumentSnapshot,
  startAfter,
} from 'firebase/firestore';

let cachedCharacters: QueryDocumentSnapshot<ICharacter>[] = [];

function _MarketPage() {
  const intl = useIntl();
  const [loadMore, setLoadMore] = React.useState(cachedCharacters.length === 0);
  const isMobile = useMediaQuery('(max-width:600px)');
  const columns = isMobile ? 3 : 5;
  const fetchLimit = columns * 4;
  const lastCharacter = cachedCharacters[cachedCharacters.length - 1];
  const { data: characters } = useCollection<ICharacter>(
    loadMore ? charactersPath : null,
    orderBy('price'),
    ...(lastCharacter ? [startAfter(lastCharacter)] : []),
    limit(fetchLimit)
  );

  React.useEffect(() => {
    if (characters?.length) {
      cachedCharacters = cachedCharacters.concat(characters);
      console.log('Loaded', cachedCharacters.length, 'characters');
      setLoadMore(false);
    }
  }, [characters]);

  const gridGap = 5;
  const size = window.innerWidth / columns - gridGap * columns;

  return (
    <Page
      useGradient
      paddingX={0}
      title={intl.formatMessage({
        defaultMessage: 'Market',
        description: 'Market page title',
      })}
      titleImage={
        <img
          src={marketImage}
          width="100%"
          style={{
            maxWidth: '562px',
            maxHeight: '50vh',
            objectFit: 'contain',
          }}
          alt=""
        />
      }
    >
      <FlexBox flexDirection="row" flexWrap="wrap" mt={0} gridGap={gridGap}>
        {cachedCharacters.map((character, index) => (
          <Intersection
            key={character.id}
            width={size}
            height={size + gridGap * 4}
            onInView={() => {
              if (index > cachedCharacters.length - columns * 2) {
                setLoadMore(true);
              }
            }}
          >
            <CharacterTile character={character} size={size} />
          </Intersection>
        ))}
      </FlexBox>
    </Page>
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
  const { ref, inView } = useInView({ threshold: 0 });
  React.useEffect(() => {
    if (inView) {
      onInView();
    }
  }, [inView, onInView]);

  return (
    <div ref={ref} style={{ width, height, overflow: 'hidden' }}>
      {children}
    </div>
  );
};

const Intersection = React.memo(_Intersection, () => true);

const MarketPage = React.memo(_MarketPage);
export default MarketPage;
