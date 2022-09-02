import { EndRoundDisplayOverlay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { CharacterImage } from '@/components/pages/Characters/CharacterImage';
import { getOfficialChallengeTitle } from '@/components/pages/StoryModePage/StoryModePage';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import { IChallenge, IIngameChallengeAttempt } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
//import { useUser } from '../../../state/UserStore';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';
import { ReactComponent as StopwatchIcon } from '@/icons/stopwatch.svg';
import SvgIcon from '@mui/material/SvgIcon/SvgIcon';
import Typography from '@mui/material/Typography';
import { useNetworkPlayerInfo } from '@/components/hooks/useNetworkPlayerInfo';
import { DEFAULT_CHARACTER_ID } from '@/state/LocalUserStore';

export interface ChallengeReplayViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
  replayAttempt: IIngameChallengeAttempt | undefined;
}

export default function ChallengeReplayView({
  onReceivedInput,
  challenge,
  replayAttempt,
}: ChallengeReplayViewProps) {
  //const user = useUser();
  const player = useNetworkPlayerInfo();
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
          <Typography variant="h4" mb={4}>
            {challenge.isOfficial
              ? getOfficialChallengeTitle(challenge)
              : challenge.title || 'Untitled Challenge'}
          </Typography>
          <FlexBox flexDirection="row" gap={1}>
            <SvgIcon fontSize="large" sx={{ mt: -1 }}>
              <StopwatchIcon />
            </SvgIcon>
            {replayAttempt && (
              <Typography variant="h6">
                <FormattedMessage
                  defaultMessage="{timeTakenMs} seconds"
                  description="Replay time taken"
                  values={{
                    timeTakenMs: (
                      replayAttempt.stats!.timeTakenMs / 1000
                    ).toFixed(2),
                  }}
                />
              </Typography>
            )}
          </FlexBox>
          {replayAttempt && (
            <FlexBox gap={1}>
              <FlexBox my={-2}>
                <CharacterImage
                  characterId={
                    replayAttempt.readOnly?.user?.selectedCharacterId ||
                    player?.characterId ||
                    DEFAULT_CHARACTER_ID
                  }
                  width={128}
                />
              </FlexBox>
              <Typography variant="h6">
                <FormattedMessage
                  defaultMessage="by {nickname}"
                  description="Challenge info - replay by"
                  values={{
                    nickname:
                      replayAttempt.readOnly?.user?.nickname ||
                      player?.nickname ||
                      'Unnamed Player',
                  }}
                />
              </Typography>
            </FlexBox>
          )}

          <FlexBox pt={2}>{continueButton}</FlexBox>
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
