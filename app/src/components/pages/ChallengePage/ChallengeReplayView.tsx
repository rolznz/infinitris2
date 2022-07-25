import { EndRoundDisplayOverlay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { getOfficialChallengeTitle } from '@/components/pages/StoryModePage/StoryModePage';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import { Box, Typography } from '@mui/material';
import { IChallenge, IScoreboardEntry } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
//import { useUser } from '../../../state/UserStore';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';

export interface ChallengeReplayViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
  replayScoreboardEntry: IScoreboardEntry | undefined;
}

export default function ChallengeReplayView({
  onReceivedInput,
  challenge,
  replayScoreboardEntry,
}: ChallengeReplayViewProps) {
  //const user = useUser();
  const [hasReceivedInput, continueButton] = useContinueButton(
    undefined,
    <FormattedMessage
      defaultMessage="View Replay"
      description="Challenge info - Start replay button text"
    />,
    undefined,
    undefined,
    'large'
  );

  useTrue(hasReceivedInput, onReceivedInput);
  //const translation = challenge?.translations?.[user.locale];

  return (
    <FlexBox zIndex={zIndexes.above} width="100%" height="100%">
      <EndRoundDisplayOverlay>
        <FlexBox
          color="primary.main"
          bgcolor="background.paper"
          px={6}
          py={4}
          borderRadius={borderRadiuses.base}
          zIndex={zIndexes.above}
        >
          <Typography variant="h4">
            {challenge.isOfficial
              ? getOfficialChallengeTitle(challenge)
              : challenge.title || 'Untitled Challenge'}
          </Typography>
          {replayScoreboardEntry && (
            <FlexBox gap={1} pt={2}>
              <Typography variant="body2">
                <FormattedMessage
                  defaultMessage="Replay by"
                  description="Challenge info - replay by"
                />
              </Typography>
              <FlexBox my={-1}>
                <CharacterImage
                  characterId={replayScoreboardEntry?.characterId || '0'}
                  width={64}
                />
              </FlexBox>
              <Typography variant="h6">
                {replayScoreboardEntry?.nickname || 'Unnamed Player'}
              </Typography>
            </FlexBox>
          )}
          <Box pt={2}>{continueButton}</Box>
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
