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

type GameUIProps = {
  challengeEditorEnabled?: boolean;
  showLeaderboard?: boolean;
  chatEnabled?: boolean;
  showEndRoundDisplay?: boolean;
  allowSkipCountdown?: boolean;
};

export function GameUI({
  challengeEditorEnabled,
  showLeaderboard = true,
  chatEnabled = true,
  showEndRoundDisplay = true,
  allowSkipCountdown,
}: GameUIProps) {
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
      {chatEnabled && <IngameChat />}
      {chatEnabled && <MessageLog />}
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

function MobileRotateDevice() {
  const isLandscape = useIsLandscape();
  if (!isLandscape) {
    return (
      <FlexBox
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
