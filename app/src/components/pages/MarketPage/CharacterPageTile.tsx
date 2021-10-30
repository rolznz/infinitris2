import React from 'react';
import {
  Box,
  Card,
  Link,
  makeStyles,
  SvgIcon,
  Typography,
  useMediaQuery,
} from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';
import { useIntl } from 'react-intl';
import { ICharacter, charactersPath } from 'infinitris2-models';
import { useCollection, Document } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { borderColor, boxShadows, gold, grey, white, zIndexes } from '@/theme';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { Link as RouterLink } from 'react-router-dom';
import Routes from '@/models/Routes';
import useWindowSize from 'react-use/lib/useWindowSize';
import { DialogManager } from '@/components/ui/modals/DialogManager';
import useDialogStore from '@/state/DialogStore';
import { CharacterImage } from '../Characters/CharacterImage';

const useStyles = makeStyles((theme) => ({
  coin: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}));

type LargeCharacterTileProps = {
  character: Document<ICharacter>;
};
export function LargeCharacterTile({ character }: LargeCharacterTileProps) {
  const windowSize = useWindowSize();
  const size = Math.min(windowSize.width, windowSize.height, 512) - 100;
  const openDialog = useDialogStore((store) => store.open);
  const styles = useStyles();
  return (
    <FlexBox>
      <Box style={{ marginTop: -size * 0.1 + 'px' }} />
      <CharacterImage characterId={character.id} width={size} />

      <FlexBox
        className={styles.coin}
        style={{ position: 'relative' }}
        onClick={() => openDialog('login')}
      >
        <SvgIcon style={{ fontSize: '100px', position: 'absolute' }}>
          <CoinIcon />
        </SvgIcon>
        <Typography
          variant="h1"
          style={{
            color: gold,
            fontWeight: 700,
            marginTop: '7px',
            fontSize: 60 - character.price.toString().length * 10 + 'px',
            zIndex: zIndexes.above,
          }}
        >
          {character.price}
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
