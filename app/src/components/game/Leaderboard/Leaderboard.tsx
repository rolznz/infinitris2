import FlexBox from '@/components/ui/FlexBox';
import { SxProps, Theme } from '@mui/material/styles';
import { borderColor, borderRadiuses } from '@/theme/theme';
import { FormattedMessage } from 'react-intl';
import Typography from '@mui/material/Typography';
import { LeaderboardContents } from '@/components/game/Leaderboard/LeaderboardContents';
import useIngameStore from '@/state/IngameStore';
import React from 'react';
import { LeaderboardEntryLine } from '@/components/game/Leaderboard/LeaderboardEntryLine';
import isMobile from '@/utils/isMobile';

const sx: SxProps<Theme> = {
  backgroundColor: borderColor,
  cursor: 'pointer',
  pointerEvents: 'all',
  borderRadius: borderRadiuses.base,
};

export function Leaderboard() {
  const [isOpen, setIsOpen] = React.useState(!isMobile());
  const toggleIsOpen = React.useCallback(() => {
    setIsOpen((open) => !open);
  }, []);
  const leaderboardEmpty = useIngameStore(
    (store) => store.leaderboardEntries.length === 0
  );
  console.log('Re-render leaderboard');
  if (leaderboardEmpty) {
    return null;
  }
  if (!isOpen) {
    return <LeaderboardButton toggleIsOpen={toggleIsOpen} />;
  }

  return (
    <FlexBox
      sx={sx}
      p={2}
      width={300}
      onClick={toggleIsOpen}
      zIndex="hamburgerButton"
    >
      <Typography variant="h5" color="secondary">
        <FormattedMessage
          defaultMessage="Leaderboard"
          description="Leaderboard title"
        />
      </Typography>
      <FlexBox gap={0} mt={1} justifyItems="flex-start" width="100%">
        <LeaderboardContents />
      </FlexBox>
    </FlexBox>
  );
}

function LeaderboardButton(props: { toggleIsOpen: () => void }) {
  const leaderboardEntries = useIngameStore(
    (store) => store.leaderboardEntries
  );
  // return mini preview
  const entry =
    leaderboardEntries.find((entry) => entry.isControllable) ||
    leaderboardEntries[0];
  return (
    <FlexBox onClick={props.toggleIsOpen} zIndex="hamburgerButton" sx={sx}>
      <LeaderboardEntryLine
        key={entry.playerId}
        entry={entry}
        isLeaderboardOpen={false}
      />
    </FlexBox>
  );
}
