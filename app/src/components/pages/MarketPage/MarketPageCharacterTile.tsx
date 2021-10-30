import React from 'react';
import {
  Box,
  Card,
  Link,
  SvgIcon,
  Typography,
  useMediaQuery,
} from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';
import { useIntl } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection, Document } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { borderColor, boxShadows, grey, white, zIndexes } from '@/theme';

import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import { CharacterImage } from '../Characters/CharacterImage';
import { CharacterCoinStatChip } from '../Characters/CharacterStatChip';

type CharacterTileProps = {
  character: Document<ICharacter>;
};
export function CharacterTile({ character }: CharacterTileProps) {
  const isMobile = useMediaQuery('(max-width:600px)');
  const contentPortion = 0.8;
  const size = (isMobile ? 150 : 300) * contentPortion;
  return (
    <Link
      component={RouterLink}
      underline="none"
      to={`${Routes.market}/${character.id}`}
    >
      <FlexBox
        width={size}
        height={size * (1 / contentPortion)}
        style={{ position: 'relative' }}
      >
        <CharacterImage characterId={character.id} width={size * 1.2} />
        <FlexBox mt={-size * 0.02} mb={size * 0.02}>
          <CharacterCoinStatChip value={character.price} />
        </FlexBox>
      </FlexBox>
    </Link>
  );
}
