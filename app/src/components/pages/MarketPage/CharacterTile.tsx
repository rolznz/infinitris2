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
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';

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
        <img
          src={`${process.env.REACT_APP_IMAGES_ROOT_URL}/characters/faces/${character.id}.png`}
          style={{
            width: size * 1.2 + 'px',
            height: 'auto',
          }}
        />
        <FlexBox
          mt={-size * 0.02}
          mb={size * 0.02}
          borderRadius={20}
          paddingX={1}
          paddingY={0.5}
          gridGap={5}
          flexDirection="row"
          style={{
            backgroundColor: borderColor,
            boxShadow: boxShadows.small,
          }}
        >
          <SvgIcon>
            <CoinIcon />
          </SvgIcon>
          <Typography
            variant="h5"
            style={{ color: white, fontWeight: 700, marginTop: '3px' }}
          >
            {character.price}
          </Typography>
        </FlexBox>
      </FlexBox>
    </Link>
  );
}
