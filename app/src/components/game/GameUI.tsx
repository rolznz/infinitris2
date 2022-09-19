import { ChallengeEditorTopRightPanelContents } from '@/components/game/ChallengeEditor/ChallengeEditorTopRightPanelContents';
import ChatButton from '@/components/game/ChatButton';
import { EndRoundDisplay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import { IngameChat } from '@/components/game/IngameChat';
import { Leaderboard } from '@/components/game/Leaderboard/Leaderboard';
import { MessageLog } from '@/components/game/MessageLog';
import { SpawnDelayDisplay } from '@/components/game/SpawnDelayDisplay';
import { useIsLandscape } from '@/components/hooks/useIsLandscape';
import FlexBox from '@/components/ui/FlexBox';
import Typography from '@mui/material/Typography';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactComponent as RefreshIcon } from '@/icons/refresh.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import { useUser } from '@/components/hooks/useUser';
import useIngameStore from '@/state/IngameStore';
import { borderRadiuses } from '@/theme/theme';

type GameUIProps = {
  challengeEditorEnabled?: boolean;
  showLeaderboard?: boolean;
  chatEnabled?: boolean;
  showEndRoundDisplay?: boolean;
  allowSkipCountdown?: boolean;
  showWaitForRoundEnd?: boolean;
};

export function GameUI({
  challengeEditorEnabled,
  showLeaderboard = true,
  chatEnabled = true,
  showEndRoundDisplay = true,
  allowSkipCountdown,
  showWaitForRoundEnd,
}: GameUIProps) {
  const user = useUser();
  const endRoundDisplayOpen = useIngameStore(
    (store) => store.endRoundDisplayOpen
  );

  if (
    user.showUI === false &&
    !challengeEditorEnabled &&
    !endRoundDisplayOpen
  ) {
    return null;
  }
  console.log('Re-render game UI');

  return (
    <FlexBox
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      zIndex={2}
      sx={{
        pointerEvents: 'none',
      }}
    >
      {showWaitForRoundEnd && <WaitForRoundEndMessage />}
      {chatEnabled && <IngameChat />}
      <MessageLog />
      <TopRightPanel>
        {challengeEditorEnabled && <ChallengeEditorTopRightPanelContents />}
        {chatEnabled && !challengeEditorEnabled && <ChatButton />}
        {showLeaderboard && <Leaderboard />}
      </TopRightPanel>
      {showEndRoundDisplay && (
        <EndRoundDisplay allowSkipCountdown={allowSkipCountdown} />
      )}
      <SpawnDelayDisplay />
      <MobileRotateDevice />
    </FlexBox>
  );
}

function TopRightPanel(props: React.PropsWithChildren<{}>) {
  console.log('Re-render top right panel');
  return (
    <FlexBox
      flexDirection="row"
      zIndex="hamburgerButton"
      sx={{
        opacity: 1,
        position: 'fixed',
        top: 0,
        right: 0,
        pointerEvents: 'none',
      }}
      justifyContent="flex-start"
      alignItems="flex-start"
      p={2}
      gap={1}
    >
      {props.children}
    </FlexBox>
  );
}

export function MobileRotateDevice() {
  const isLandscape = useIsLandscape();
  if (!isLandscape) {
    return (
      <FlexBox
        position="fixed"
        top={0}
        left={0}
        zIndex={999999999999999999}
        width="100vw"
        height="100vh"
        px={8}
        bgcolor="background.paper"
      >
        <Typography variant="h1">
          <FormattedMessage
            defaultMessage="Rotate Device"
            description="Mobile Rotate Device title"
          />
        </Typography>
        <FlexBox py={2}>
          <SvgIcon color="primary" fontSize="large">
            <RefreshIcon />
          </SvgIcon>
        </FlexBox>
        <Typography variant="body2" textAlign="center">
          <FormattedMessage
            defaultMessage="Please unlock device rotation and rotate your device to continue"
            description="Mobile Rotate Device title"
          />
        </Typography>
      </FlexBox>
    );
  } else {
    return null;
  }
}

export function WaitForRoundEndMessage() {
  const isWaitingForRoundToEnd = useIngameStore(
    (store) => store.isWaitingForRoundToEnd
  );
  if (!isWaitingForRoundToEnd) {
    return null;
  }

  return (
    <FlexBox position="fixed" top={0} left={0} zIndex={10000} width="100%">
      <FlexBox
        bgcolor="background.paper"
        mt={10}
        p={1}
        borderRadius={borderRadiuses.base}
      >
        <Typography variant="h1">
          <FormattedMessage
            defaultMessage="Please wait for the current round to finish..."
            description="Wait for current round to end message"
          />
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
