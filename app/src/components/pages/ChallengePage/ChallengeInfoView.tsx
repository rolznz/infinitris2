import useContinueButton from '@/components/hooks/useContinueButton';
import { borderRadiuses } from '@/theme/theme';
import { Box, Typography } from '@mui/material';
import { IChallenge } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '../../../state/UserStore';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';

export interface ChallengeInfoViewProps {
  onReceivedInput(): void;
  challenge: IChallenge;
}

export default function ChallengeInfoView({
  onReceivedInput,
  challenge,
}: ChallengeInfoViewProps) {
  const user = useUser();
  const [hasReceivedInput, continueButton] = useContinueButton();

  useTrue(hasReceivedInput, onReceivedInput);
  const translation = challenge?.translations?.[user.locale];

  return (
    <FlexBox flex={1} maxWidth="100%" padding={4}>
      <FlexBox
        color="primary.main"
        bgcolor="background.paper"
        padding={4}
        borderRadius={borderRadiuses.base}
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
        <Box pt={2}>{continueButton}</Box>
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
