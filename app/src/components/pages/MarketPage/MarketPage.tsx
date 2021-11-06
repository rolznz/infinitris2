import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { useIntl } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { CharacterTile } from './MarketPageCharacterTile';
import marketImage from './assets/market.png';

export default function MarketPage() {
  const intl = useIntl();
  const { data: characters } = useCollection<ICharacter>(charactersPath, {
    orderBy: 'price',
  });

  console.log('Characters: ', characters);

  return (
    <Page useGradient paddingX={0}>
      <img
        src={marketImage}
        width="100%"
        style={{ maxWidth: '562px', maxHeight: '50vh', objectFit: 'contain' }}
      />
      {characters && (
        <FlexBox flexDirection="row" flexWrap="wrap" mt={6} gridGap={5}>
          {characters?.map((character) => (
            <CharacterTile key={character.id} character={character} />
          ))}
        </FlexBox>
      )}
    </Page>
  );
}
