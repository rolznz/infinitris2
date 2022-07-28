import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';
import { useUser } from '@/components/hooks/useUser';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import FlexBox from '@/components/ui/FlexBox';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';
import {
  borderRadiuses,
  colors,
  dropShadows,
  textShadows,
} from '@/theme/theme';
import LinearProgress from '@mui/material/LinearProgress/LinearProgress';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { WorldType } from 'infinitris2-models';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as GoldMedal } from './assets/world_progress_gold.svg';
import { ReactComponent as IncompleteMedal } from './assets/world_progress_incomplete.svg';

const typographySx: SxProps<Theme> = {
  color: colors.white,
  textShadow: textShadows.small,
  fontSize: 24,
  position: 'absolute',
};

type WorldProgressProps = {
  worldType: WorldType | undefined;
};

const medalProps: React.SVGProps<SVGSVGElement> = {
  width: 40,
  height: 40,
  filter: dropShadows.small,
};

export function WorldProgress({ worldType }: WorldProgressProps) {
  const incompleteChallenges = useIncompleteChallenges(worldType);
  const user = useUser();
  const progress = incompleteChallenges?.isLoadingOfficialChallenges
    ? 0
    : 5 - incompleteChallenges.incompleteChallenges?.length;
  const progressPercentage = (progress / 5) * 100;

  const medals = [0, 1, 2, 3, 4].map((value) => (
    <FlexBox
      key={value}
      position="absolute"
      left={`calc(${Math.min(value + 1, 4.9) * 20}% - 20px)`}
      top={40}
      zIndex={1}
    >
      <Typography variant="body1" sx={{ position: 'absolute' }} zIndex={1}>
        {value + 1}
      </Typography>
      {progress > value ? (
        <GoldMedal {...medalProps} />
      ) : (
        <IncompleteMedal {...medalProps} />
      )}
    </FlexBox>
  ));

  return (
    <FlexBox
      position="absolute"
      top={120}
      zIndex={1}
      justifyContent="center"
      alignItems="center"
      border="3px solid #E6E6E644;"
      borderRadius={borderRadiuses.full}
      p={1}
      sx={{
        background: 'rgba(248, 248, 246, 0.3)',
      }}
    >
      <FlexBox position="relative">
        <FlexBox position="absolute" left={-40} top={-40} zIndex={1}>
          <CharacterImage
            width={120}
            characterId={user.selectedCharacterId || DEFAULT_CHARACTER_ID}
            hasShadow
          />
        </FlexBox>
        {medals}
        <LinearProgress
          value={progressPercentage}
          style={{
            height: '40px',
            width: '500px',
            maxWidth: '70vw',
          }}
          variant="determinate"
          sx={{
            border: 'none',
            borderRadius: borderRadiuses.full,
            '.MuiLinearProgress-barColorPrimary': {
              background: 'linear-gradient(270deg, #F08200 0%, #D2AA19 100%)',
              borderRadius: progress === 5 ? borderRadiuses.full : undefined,
              width: 'calc(100% + 1px)', // hacky fix for background of root component slightly showing through
            },
            '&.MuiLinearProgress-root': {
              background: 'linear-gradient(270deg, #0F1529 1.31%, #0C2F40 50%)',
              borderRadius: borderRadiuses.full,
            },
          }}
        />
        <Typography variant="body1" sx={typographySx}>
          <FormattedMessage
            defaultMessage="World Progress"
            description="world progress bar text"
          />
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
