import FlexBox from '@/components/ui/FlexBox';
import { SxProps, Theme } from '@mui/material/styles';
import starImage from './assets/winner_star.svg';
import ribbonImage from './assets/winner_ribbon.svg';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import useWindowSize from 'react-use/lib/useWindowSize';
import { PlacingStar } from '@/components/pages/Characters/PlacingStar';
import Typography from '@mui/material/Typography';
import useIngameStore from '@/state/IngameStore';
import React from 'react';
import { colors, textShadows } from '@/theme/theme';
import { hexToString, PlayerStatus } from 'infinitris2-models';
import { FormattedMessage } from 'react-intl';

const bgSx: SxProps<Theme> = {
  background: 'linear-gradient(180deg, rgba(11, 9, 86, 0) 0%, #0C0A60 100%)',
};

export function EndRoundDisplay() {
  console.log('Re-render end round display');
  const simulation = useIngameStore((store) => store.simulation);
  const endRoundDisplayOpen = useIngameStore(
    (store) => store.endRoundDisplayOpen
  );
  const windowSize = useWindowSize();
  const characterSize = windowSize.width * 0.25;
  const starSize = characterSize * 1.1;
  const ribbonSize = starSize * 0.4;

  const winner = simulation?.round?.winner;
  const nameTypographySx: SxProps<Theme> = React.useMemo(
    () => ({
      color: hexToString(winner?.color || 0),
      textShadow: textShadows.small,
      size: Math.floor(characterSize / 10) + 'px',
    }),
    [winner?.color, characterSize]
  );

  if (!endRoundDisplayOpen) {
    return null;
  }

  return (
    <FlexBox width="100%" height="100%" sx={bgSx} gap={2}>
      {winner && (
        <FlexBox height={starSize} maxWidth="90vw" position="relative">
          <img alt="" src={starImage} height={starSize} />
          <FlexBox position="absolute">
            <CharacterImage
              characterId={winner.characterId || '0'}
              width={characterSize}
            />
            <PlacingStar
              placing={1}
              offset={characterSize * 0.22}
              scale={characterSize * 0.005}
            />
          </FlexBox>
          <FlexBox position="absolute" bottom={-ribbonSize * 0.1}>
            <img alt="" src={ribbonImage} height={ribbonSize} />
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
                  nickname: winner.nickname,
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
  console.log('Re-render next round indicator');
  const simulation = useIngameStore((store) => store.simulation);
  const [renderId, setRenderId] = React.useState(0);
  const conditionsAreMet = useIngameStore(
    (store) => store.roundConditionsAreMet
  );
  React.useEffect(() => {
    if (conditionsAreMet) {
      setTimeout(() => setRenderId((state) => state + 1), 1000);
    }
  }, [conditionsAreMet, renderId]);

  if (!simulation || !simulation.round) {
    return null;
  }

  return (
    <FlexBox>
      <Typography variant="h2" textAlign="center">
        {conditionsAreMet ? (
          <FormattedMessage
            defaultMessage="Next round starting in"
            description="end round display next round starting in"
          />
        ) : (
          <FormattedMessage
            defaultMessage="Waiting for players..."
            description="end round display waiting for players"
          />
        )}
      </Typography>
      {conditionsAreMet && (
        <Typography variant="h1" fontSize={60}>
          {Math.ceil((simulation.round.nextRoundTime - Date.now()) / 1000)}
        </Typography>
      )}

      <Typography variant="h1" fontSize={16} mt={2}>
        <FormattedMessage
          defaultMessage="{numPlayers} players connected"
          description="end round display num players connected"
          values={{
            numPlayers: simulation.nonSpectatorPlayers.length,
          }}
        />
      </Typography>
      <FlexBox mt={1} flexDirection="row" flexWrap="wrap" width="50%">
        {simulation.nonSpectatorPlayers.map((player) => (
          <CharacterImage
            key={player.id}
            characterId={player.characterId || '0'}
            width={32}
            hasShadow={player.isControllable}
          />
        ))}
      </FlexBox>
    </FlexBox>
  );
}
