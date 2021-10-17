import React from 'react';
import { Box, Card, Typography, useMediaQuery } from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection, Document } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { white } from '@/theme';
import { ReactComponent as CoinIcon } from '@/icons/twitter.svg';

export default function ScoreboardPage() {
  const { data: characters } = useCollection<ICharacter>(charactersPath, {
    orderBy: 'price',
  });

  return (
    <Page useGradient>
      {characters && (
        <FlexBox flexDirection="row" flexWrap="wrap" mt={6} gridGap={0} mx={-4}>
          {characters?.map((character) => (
            <CharacterTile key={character.id} character={character} />
          ))}
        </FlexBox>
      )}
    </Page>
  );
}

type CharacterTileProps = {
  character: Document<ICharacter>;
};
export function CharacterTile({ character }: CharacterTileProps) {
  const isMobile = useMediaQuery('(max-width:400px)');
  const size = isMobile ? 150 : 300;
  return (
    <FlexBox position="relative" width={size} height={size} mx={-2}>
      <img
        src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/faces/${character.id}.png`}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <FlexBox
        position="absolute"
        bgcolor={'#A0997D'}
        top={size * 0.29}
        right={size * 0.29}
        borderRadius={20}
        paddingX={1}
        paddingY={0}
      >
        <Typography variant="body1" style={{ color: white }}>
          <CoinIcon />
          {character.price}
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
