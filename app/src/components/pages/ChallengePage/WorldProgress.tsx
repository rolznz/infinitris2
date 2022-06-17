import useIncompleteChallenges from '@/components/hooks/useIncompleteChallenges';
import FlexBox from '@/components/ui/FlexBox';
import { colors, textShadows } from '@/theme/theme';
import LinearProgress from '@mui/material/LinearProgress/LinearProgress';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from 'react-intl';

const typographySx: SxProps<Theme> = {
  color: colors.black,
  textShadow: textShadows.small,
  fontSize: 24,
  position: 'absolute',
};

export function WorldProgress() {
  const incompleteChallenges = useIncompleteChallenges('grass');
  const progress = incompleteChallenges?.isLoadingOfficialChallenges
    ? 0
    : ((5 - incompleteChallenges.incompleteChallenges?.length) / 5) * 100;

  return (
    <FlexBox
      position="absolute"
      top={20}
      width="100%"
      zIndex={1}
      justifyContent="center"
      alignItems="center"
    >
      <FlexBox position="relative">
        <LinearProgress
          value={progress}
          style={{
            height: '40px',
            width: '600px',
            maxWidth: '80%',
          }}
          variant="determinate"
          sx={{
            '.MuiLinearProgress-barColorPrimary': {
              backgroundColor: colors.lightBlue,
            },
            '&.MuiLinearProgress-root': {
              backgroundColor: colors.white,
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
