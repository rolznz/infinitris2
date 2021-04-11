import React from 'react';
import { Typography } from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';

export default function ScoreboardPage() {
  return (
    <FlexBox flex={1} justifyContent="flex-start" maxWidth={500} marginX="auto">
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Scoreboard"
          description="Scoreboard page title"
        />
      </Typography>
    </FlexBox>
  );
}
