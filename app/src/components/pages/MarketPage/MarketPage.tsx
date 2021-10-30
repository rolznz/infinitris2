import React from 'react';

import FlexBox from '../../ui/FlexBox';
import { useIntl } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { CharacterTile } from './MarketPageCharacterTile';

export default function MarketPage() {
  const intl = useIntl();
  const { data: characters } = useCollection<ICharacter>(charactersPath, {
    orderBy: 'price',
  });

  console.log('Characters: ', characters);

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Market',
        description: 'Market page title',
      })}
      useGradient
      paddingX={0}
    >
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
