import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { useIntl } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection, Document } from 'swr-firestore';
import { Page } from '../../ui/Page';
import {
  CharacterTile,
  characterTileContentPortion,
} from './MarketPageCharacterTile';
import marketImage from './assets/market.png';
import { useInView } from 'react-intersection-observer';
import { Button, useMediaQuery } from '@material-ui/core';

let cachedCharacters: Document<ICharacter>[] = [];
let lastCharacter = undefined;

function _MarketPage() {
  const intl = useIntl();
  const [loadMore, setLoadMore] = React.useState(true);
  const [startsAt, setStartsAt] = React.useState(0);
  const isMobile = useMediaQuery('(max-width:600px)');
  const columns = isMobile ? 3 : 5;
  const limit = columns * 2;
  const { data: characters } = useCollection<ICharacter>(charactersPath, {
    orderBy: 'price',
    startAt: startsAt, //cachedCharacters.length + 1,
    limit,
  });
  lastCharacter = characters?.[0].id;

  console.log(
    'startAt is now',
    characters,
    lastCharacter,
    'loadMore',
    loadMore
  );

  const [loadedCharacters, setLoadedCharacters] =
    React.useState<Document<ICharacter>[]>(cachedCharacters);
  React.useEffect(() => {
    if (characters?.length) {
      cachedCharacters = loadedCharacters.concat(characters);
      setLoadedCharacters(cachedCharacters);
      setLoadMore(false);
    }
  }, [characters, loadedCharacters, setLoadedCharacters]);

  const gridGap = 5;
  const size = window.innerWidth / columns - gridGap * columns;

  console.log('Characters: ', loadedCharacters);

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
        />
      }
    >
      <FlexBox flexDirection="row" flexWrap="wrap" mt={0} gridGap={gridGap}>
        {loadedCharacters.map((character, index) => (
          <Intersection
            key={character.id}
            width={size}
            height={size + gridGap * 4}
            onInView={() => {
              if (index > loadedCharacters.length - columns) {
                console.log('In view, load more: ' + index);
                setLoadMore(true);
              }
            }}
          >
            <p>{index}</p>
            <CharacterTile character={character} size={size} />
          </Intersection>
        ))}
      </FlexBox>
      <Button onClick={() => setStartsAt((s) => s + limit)}>Load more</Button>
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
  }, [inView]);

  return (
    <div ref={ref} style={{ width, height, overflow: 'hidden' }}>
      {children}
    </div>
  );
};

const Intersection = React.memo(_Intersection, () => true);

const MarketPage = React.memo(_MarketPage);
export default MarketPage;
