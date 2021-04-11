import React from 'react';
import { Box, Typography } from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';

export default function EarnCreditsPage() {
  useLoginRedirect();

  return (
    <FlexBox flex={1} justifyContent="flex-start" maxWidth={500} marginX="auto">
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Earn Credits"
          description="Earn Credits page title"
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="Credits can be used to purchase ingame items and create challenges, and holding credits will place you higher on the scoreboard. You can earn credits in a variety of ways."
          description="Earn credits information"
        />
      </Typography>
      <ul>
        <li>
          <Typography>
            <FormattedMessage
              defaultMessage="Passive daily reward - 1 credit"
              description="Earn credits information - passive reward"
            />
          </Typography>
        </li>
        <li>
          <Typography>
            <FormattedMessage
              defaultMessage="Receive positive (4 or 5 star) ratings for created challenges - 1 credit per rating*"
              description="Earn credits information - receive positive challenge rating"
            />
          </Typography>
        </li>
        <li>
          <Typography>
            <FormattedMessage
              defaultMessage="Rate other users' challenges - 1 credit per rating"
              description="Earn credits information - give rating"
            />
          </Typography>
        </li>
        <li>
          <Typography>
            <FormattedMessage
              defaultMessage={`Affiliate program - coming soon`}
              description="Earn credits information - affiliate program"
            />
          </Typography>
        </li>
      </ul>
      <Box mt={10} />
      <Typography variant="caption">
        <FormattedMessage
          defaultMessage={`*Saving a new challenge will cost 1 credit. This is to reduce spam.`}
          description="Earn credits information - fine print"
        />
      </Typography>
      <Typography variant="caption">
        <FormattedMessage
          defaultMessage={`Credit rewards may change over time.`}
          description="Earn credits information - credit rewards may change"
        />
      </Typography>
    </FlexBox>
  );
}
