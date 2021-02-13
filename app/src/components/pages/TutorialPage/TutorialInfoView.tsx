import { Box, Typography } from '@material-ui/core';
import { ITutorial } from 'infinitris2-models';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '../../../state/UserStore';
import ContinueHint from '../../ContinueHint';
import useReceivedInput from '../../hooks/useReceivedInput';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../layout/FlexBox';

export interface TutorialInfoViewProps {
  onReceivedInput(): void;
  tutorial: ITutorial;
}

export default function TutorialInfoView({
  onReceivedInput,
  tutorial,
}: TutorialInfoViewProps) {
  const user = useUser();
  const [hasReceivedInput] = useReceivedInput();
  useTrue(hasReceivedInput, onReceivedInput);
  const translation = tutorial?.translations?.[user.locale];

  return (
    <FlexBox flex={1} maxWidth="100%" padding={4}>
      <FlexBox
        color="primary.main"
        bgcolor="background.paper"
        padding={4}
        borderRadius={16}
      >
        <Typography variant="h6">
          {translation?.title || tutorial?.title}
        </Typography>
        <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
          {translation?.description || tutorial?.description || (
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
            description="Number of times the user has attempted this tutorial"
            values={{
              attemptCount:
                (user.tutorialAttempts[tutorial.id]?.length || 0) + 1,
            }}
          />
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
