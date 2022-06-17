import { ChallengeEditorTopRightPanelContents } from '@/components/game/ChallengeEditor/ChallengeEditorTopRightPanelContents';
import ChatButton from '@/components/game/ChatButton';
import { EndRoundDisplay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import { IngameChat } from '@/components/game/IngameChat';
import { Leaderboard } from '@/components/game/Leaderboard/Leaderboard';
import { MessageLog } from '@/components/game/MessageLog';
import { SpawnDelayDisplay } from '@/components/game/SpawnDelayDisplay';
import FlexBox from '@/components/ui/FlexBox';
import React from 'react';

type GameUIProps = {
  challengeEditorEnabled?: boolean;
  showLeaderboard?: boolean;
  chatEnabled?: boolean;
  showEndRoundDisplay?: boolean;
};

export function GameUI({
  challengeEditorEnabled,
  showLeaderboard = true,
  chatEnabled = true,
  showEndRoundDisplay = true,
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
      {showEndRoundDisplay && <EndRoundDisplay />}
      <SpawnDelayDisplay />
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
