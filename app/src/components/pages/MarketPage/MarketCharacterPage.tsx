import React from 'react';
import { ICharacter, getCharacterPath } from 'infinitris2-models';
import { useDocument } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { useParams } from 'react-router-dom';
import { LargeCharacterTile } from './CharacterPageTile';
import { useUser } from '@/state/UserStore';
import FlexBox from '@/components/ui/FlexBox';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { SvgIcon, Typography } from '@material-ui/core';
import { white } from '@/theme';

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const { data: character } = useDocument<ICharacter>(getCharacterPath(id));
  const user = useUser();

  return (
    <Page
      title={character ? `#${character?.id} ${character?.name}` : undefined}
    >
      {character && <LargeCharacterTile character={character} />}
      <FlexBox
        top={0}
        left={0}
        padding={2}
        gridGap={10}
        flexDirection="row"
        style={{
          position: 'absolute',
        }}
      >
        <SvgIcon fontSize="large">
          <CoinIcon />
        </SvgIcon>
        <Typography
          variant="h4"
          style={{ color: white, fontWeight: 700, marginTop: '3px' }}
        >
          {user.readOnly.coins || 0}
        </Typography>
      </FlexBox>
    </Page>
  );
}
