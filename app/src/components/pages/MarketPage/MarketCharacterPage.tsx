import React from 'react';
import { ICharacter, getCharacterPath } from 'infinitris2-models';
import { useDocument } from 'swr-firestore';
import { Page } from '../../ui/Page';
import { useParams } from 'react-router-dom';
import { LargeCharacterTile } from './CharacterPageTile';
import { useUser } from '@/state/UserStore';
import FlexBox from '@/components/ui/FlexBox';
import { ReactComponent as CoinIcon } from '@/icons/coin.svg';
import { SvgIcon, Typography } from '@mui/material';
import { white, zIndexes } from '@/theme';
import { Carousel } from '@/components/ui/Carousel';
import { BlockPreview } from './BlockPreview';

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const { data: character } = useDocument<ICharacter>(getCharacterPath(id));
  const user = useUser();

  const pages: React.ReactNode[] = character
    ? [
        <LargeCharacterTile character={character} />,
        <BlockPreview character={character} />,
      ]
    : [];

  return (
    <Page
      title={
        character ? `#${character?.id} ${character?.data()?.name}` : undefined
      }
      whiteTitle
      background={
        <FlexBox zIndex={zIndexes.below}>
          {character && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: `url(${process.env.REACT_APP_IMAGES_ROOT_URL}/habitats/${id}.svg)`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                pointerEvents: 'none',
              }}
            ></div>
          )}
          {character && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '100vw',
                height: '100vh',
                background: `url(${
                  process.env.REACT_APP_IMAGES_ROOT_URL
                }/patterns/${character.data()!.patternFilename})`,
                backgroundRepeat: 'repeat',
                backgroundSize:
                  Math.max(window.innerWidth, window.innerHeight) / 4,
                opacity: 0.2,
                pointerEvents: 'none',
              }}
            ></div>
          )}
        </FlexBox>
      }
    >
      <FlexBox zIndex={zIndexes.above}>
        {character && <Carousel pages={pages} />}
        {/*<FlexBox
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
      </FlexBox>*/}
      </FlexBox>
    </Page>
  );
}
