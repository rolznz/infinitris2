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
import { textShadows } from '@/theme/theme';
import { hexToString, IPlayer } from 'infinitris2-models';
import { FormattedMessage } from 'react-intl';
import ChallengeMedalDisplay from '@/components/pages/ChallengePage/ChallengeMedalDisplay';

const bgSx: SxProps<Theme> = {
  background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)',
};

export function EndRoundDisplayOverlay({
  children,
}: React.PropsWithChildren<{}>) {
  return (
    <FlexBox width="100%" height="100%" sx={bgSx} gap={2}>
      {children}
    </FlexBox>
  );
}

export function EndRoundDisplay() {
  console.log('Re-render end round display');
  const simulation = useIngameStore((store) => store.simulation);
  const endRoundDisplayOpen = useIngameStore(
    (store) => store.endRoundDisplayOpen
  );
  const windowSize = useWindowSize();
  const characterSize = Math.min(
    windowSize.width * 0.55,
    windowSize.height * 0.45
  );

  const winner = simulation?.round?.winner;

  if (!endRoundDisplayOpen) {
    return null;
  }

  return (
    <EndRoundDisplayOverlay>
      {winner && (
        <RoundWinnerDisplay winner={winner} characterSize={characterSize} />
      )}
      <NextRoundIndicator />
    </EndRoundDisplayOverlay>
  );
}

type RoundWinnerDisplayProps = {
  characterSize: number;
  winner: IPlayer;
  message?: React.ReactNode;
  medalIndex?: number;
};

export function RoundWinnerDisplay({
  winner,
  characterSize,
  message,
  medalIndex,
}: RoundWinnerDisplayProps) {
  const starSize = characterSize * 1.1;
  const ribbonSize = starSize * 0.4;
  const nameTypographySx: SxProps<Theme> = React.useMemo(
    () => ({
      color: hexToString(winner?.color || 0),
      textShadow: textShadows.small,
      fontSize: Math.floor(characterSize / 10) + 'px',
    }),
    [winner?.color, characterSize]
  );

  return (
    <FlexBox height={starSize} maxWidth="90vw" position="relative">
      <img alt="" src={starImage} height={starSize} />
      <FlexBox position="absolute">
        <CharacterImage
          characterId={winner.characterId || '0'}
          width={characterSize}
        />
        {medalIndex === undefined && (
          <PlacingStar
            placing={1}
            offset={characterSize * 0.22}
            scale={characterSize * 0.005}
          />
        )}
      </FlexBox>
      <FlexBox position="absolute" bottom={ribbonSize * 0}>
        {medalIndex !== undefined && (
          <ChallengeMedalDisplay
            medalIndex={medalIndex}
            size={characterSize * 0.3}
          />
        )}
      </FlexBox>
      <FlexBox position="absolute" bottom={-ribbonSize * 0.1}>
        <img alt="" src={ribbonImage} height={ribbonSize} />
        <Typography
          variant="h1"
          sx={nameTypographySx}
          position="absolute"
          top={characterSize / 10}
        >
          {message || (
            <FormattedMessage
              defaultMessage="{nickname} WINS!"
              description="end round display player wins message"
              values={{
                nickname: winner.nickname,
              }}
            />
          )}
        </Typography>
      </FlexBox>
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
