import { EndRoundDisplayOverlay } from '@/components/game/EndRoundDisplay/EndRoundDisplay';
import useContinueButton from '@/components/hooks/useContinueButton';
import { borderRadiuses, zIndexes } from '@/theme/theme';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useTrue from '../../hooks/useTrue';
import FlexBox from '../../ui/FlexBox';

export interface ChallengeFailedViewProps {
  onReceivedInput(): void;
}

export default function ChallengeFailedView({
  onReceivedInput,
}: ChallengeFailedViewProps) {
  const [hasReceivedInput, continueButton] = useContinueButton(
    undefined,
    <FormattedMessage
      defaultMessage="Try again"
      description="Challenge Failed Try again button text"
    />,
    true
  );
  useTrue(hasReceivedInput, onReceivedInput);

  return (
    <FlexBox zIndex={zIndexes.above} width="100%" height="100%">
      <EndRoundDisplayOverlay>
        <FlexBox
          color="primary.main"
          bgcolor="background.paper"
          padding={4}
          borderRadius={borderRadiuses.base}
          zIndex={zIndexes.above}
        >
          <Typography variant="h6">Challenge Failed</Typography>
          <Box pt={2}>{continueButton}</Box>
        </FlexBox>
      </EndRoundDisplayOverlay>
    </FlexBox>
  );
}
