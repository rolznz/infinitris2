import FlexBox from '@/components/ui/FlexBox';
import { SxProps, Theme } from '@mui/material/styles';
import starImage from './assets/star.png';
import ribbonImage from './assets/ribbon.png';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import useWindowSize from 'react-use/lib/useWindowSize';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import Typography from '@mui/material/Typography';
import useIngameStore from '@/state/IngameStore';
import React from 'react';
import { colors } from '@/theme/theme';
import { hexToString } from 'infinitris2-models';
import { FormattedMessage } from 'react-intl';

const bgSx: SxProps<Theme> = {
  background: 'linear-gradient(180deg, rgba(11, 9, 86, 0) 0%, #0C0A60 100%)',
};

export function EndRoundDisplay() {
  console.log('Re-render end round display');
  const simulation = useIngameStore((store) => store.simulation);
  const windowSize = useWindowSize();
  const characterSize = windowSize.width * 0.3;
  const starSize = characterSize * 1.1;
  const ribbonSize = (starSize * 842) / 643;
  const player = simulation?.players[0];
  const nameTypographySx: SxProps<Theme> = React.useMemo(
    () => ({
      color: hexToString(player?.color || 0),
      textShadow: `0px 1px ${colors.black}`,
      size: Math.floor(characterSize / 10) + 'px',
    }),
    [player?.color, characterSize]
  );

  return (
    <FlexBox width="100%" height="100%" sx={bgSx} gap={2}>
      {player && (
        <FlexBox width={ribbonSize} maxWidth="90vw" position="relative">
          <img alt="" src={starImage} width={starSize} />
          <FlexBox position="absolute">
            <CharacterImage
              characterId={player.characterId || '0'}
              width={characterSize}
            />
            <PlacingStar
              placing={1}
              offset={characterSize * 0.22}
              scale={characterSize * 0.005}
            />
          </FlexBox>
          <FlexBox position="absolute" bottom={0}>
            <img alt="" src={ribbonImage} width={ribbonSize} />
            <Typography
              variant="h1"
              sx={nameTypographySx}
              position="absolute"
              top={characterSize / 11}
            >
              <FormattedMessage
                defaultMessage="{nickname} WINS!"
                description="end round display player wins message"
                values={{
                  nickname: player.nickname,
                }}
              />
            </Typography>
          </FlexBox>
        </FlexBox>
      )}
      <NextRoundIndicator />
    </FlexBox>
  );
}

export function NextRoundIndicator() {
  return (
    <FlexBox>
      <Typography variant="h2">
        <FormattedMessage
          defaultMessage="Next round starting in"
          description="end round display next round starting in"
        />
      </Typography>
      <Typography variant="h1" fontSize={80}>
        {3}
      </Typography>
    </FlexBox>
  );
}
