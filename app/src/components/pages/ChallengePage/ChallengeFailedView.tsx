import useContinueButton from '@/components/hooks/useContinueButton';
import { borderRadiuses } from '@/theme/theme';
import { Box, Typography } from '@mui/material';
import React from 'react';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';

export interface ChallengeFailedViewProps {
  onReceivedInput(): void;
}

export default function ChallengeFailedView({
  onReceivedInput,
}: ChallengeFailedViewProps) {
  const [hasReceivedInput, continueButton] = useContinueButton(true);
  useTrue(hasReceivedInput, onReceivedInput);

  return (
    <FlexBox flex={1} maxWidth="100%" padding={4}>
      <FlexBox
        color="primary.main"
        bgcolor="background.paper"
        padding={4}
        borderRadius={borderRadiuses.base}
      >
        <Typography variant="h6">Challenge Failed</Typography>
        <Box pt={2}>{continueButton}</Box>
      </FlexBox>
    </FlexBox>
  );
}
