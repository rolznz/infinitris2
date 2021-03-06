import { Box, Typography } from '@material-ui/core';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '../../../state/UserStore';
import ContinueHint from '../../ContinueHint';
import useReceivedInput from '../../hooks/useReceivedInput';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../layout/FlexBox';

export interface ChallengeInfoViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
}

export default function ChallengeInfoView({
  onReceivedInput,
  challenge,
}: ChallengeInfoViewProps) {
  const user = useUser();
  const [hasReceivedInput] = useReceivedInput();
  useTrue(hasReceivedInput, onReceivedInput);
  const translation = challenge?.translations?.[user.locale];

  return (
    <FlexBox flex={1} maxWidth="100%" padding={4}>
      <FlexBox
        color="primary.main"
        bgcolor="background.paper"
        padding={4}
        borderRadius={16}
      >
        <Typography variant="h6">
          {translation?.title || challenge?.title}
        </Typography>
        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
          {translation?.description || challenge?.description || (
            <FormattedMessage
              defaultMessage="No description provided"
              description="No description provided"
            />
          )}
        </Typography>
        <Box pt={2}>
          <ContinueHint />
        </Box>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage="Attempt: #{attemptCount}"
            description="Number of times the user has attempted this challenge"
            values={{
              attemptCount:
                (user.challengeAttempts[challenge.id]?.length || 0) + 1,
            }}
          />
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
