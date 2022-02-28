import React from 'react';
import { ICharacter, getCharacterPath } from 'infinitris2-models';
import { useDocument } from 'swr-firestore';
import { Page } from '../../ui/Page';
import { useParams } from 'react-router-dom';
import { LargeCharacterTile } from './CharacterPageTile';
import { useUser, useUserStore } from '@/state/UserStore';
import FlexBox from '@/components/ui/FlexBox';
import { Button } from '@mui/material';
import { zIndexes } from '@/theme/theme';
import { Carousel } from '@/components/ui/Carousel';
import { BlockPreview } from './BlockPreview';
import { FormattedMessage, useIntl } from 'react-intl';
import { LocalUser } from '@/state/LocalUserStore';
import { toast } from 'react-toastify';

export default function MarketPage() {
  const { id } = useParams<{ id: string }>();
  const { data: character } = useDocument<ICharacter>(getCharacterPath(id));
  const intl = useIntl();
  const user = useUser();
  const userStore = useUserStore();

  const pages: React.ReactNode[] = character
    ? [
        <LargeCharacterTile key="1" character={character} />,
        <BlockPreview key="2" character={character} />,
      ]
    : [];

  return (
    <Page
      title={character ? `${character?.data()?.name}` : undefined}
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
        {(user as LocalUser).characterId !== id && (
          <Button
            autoFocus
            color="primary"
            variant="contained"
            sx={{ mb: 2 }}
            onClick={() => {
              userStore.setCharacterId(id);
              toast(
                intl.formatMessage({
                  defaultMessage: 'Character Purchased',
                  description: 'Character Purchased toast message',
                })
              );
            }}
          >
            <FormattedMessage
              defaultMessage="Buy"
              description="Character page - buy button"
            />
          </Button>
        )}
        {character && <Carousel slides={pages} />}
        {/*<FlexBox
        top={0}
        left={0}
        padding={2}
        gap={1}
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
          style={{ color: colors.white, fontWeight: 700, marginTop: '3px' }}
        >
          {user.readOnly.coins || 0}
        </Typography>
      </FlexBox>*/}
      </FlexBox>
    </Page>
  );
}
