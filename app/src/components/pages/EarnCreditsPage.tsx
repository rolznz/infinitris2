import React from 'react';
import { Box, Typography, Link } from '@material-ui/core';

import FlexBox from '../ui/FlexBox';
import { FormattedMessage } from 'react-intl';

import useLoginRedirect from '../hooks/useLoginRedirect';

import Routes from '../../models/Routes';
import { Link as RouterLink } from 'react-router-dom';

export default function EarnCreditsPage() {
  useLoginRedirect();

  return (
    <FlexBox flex={1} justifyContent="flex-start" maxWidth={500} marginX="auto">
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Earn Coins"
          description="Earn Coins page title"
        />
      </Typography>

      <Typography align="center">
        <FormattedMessage
          defaultMessage="Coins can be used to purchase ingame items and create challenges, and holding coins will place you higher on the scoreboard. You can earn coins in a variety of ways."
          description="Earn coins information"
        />
      </Typography>
      <ul>
        <li>
          <Typography>
            <FormattedMessage
              defaultMessage="Passive daily reward - 1 credit"
              description="Earn coins information - passive reward"
            />
          </Typography>
        </li>
        <li>
          <Typography>
            <FormattedMessage
              defaultMessage="Increase your network impact - 1 credit per new impact"
              description="Earn coins information - increase network impact"
            />
          </Typography>
          <ul>
            <li>
              <Typography>
                <FormattedMessage
                  defaultMessage="Create a challenge¹"
                  description="Earn coins information - receive positive challenge rating"
                />
              </Typography>
            </li>
            <li>
              <Box display="flex">
                <Link
                  component={RouterLink}
                  underline="none"
                  to={Routes.affiliateProgram}
                  style={{ flexShrink: 0 }}
                >
                  <Typography>
                    <FormattedMessage
                      defaultMessage={`Invite your friends²`}
                      description="Earn coins information - invite your friends (affiliate program) link"
                    />
                  </Typography>
                </Link>
              </Box>
            </li>
            <li>
              <Typography>
                <FormattedMessage
                  defaultMessage="Mutual network impacts³"
                  description="Earn coins information - mutual network impacts"
                />
              </Typography>
            </li>
          </ul>
        </li>
      </ul>
      <Box mt={10} />
      <FlexBox alignItems="flex-start">
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage={`¹Saving a new challenge will cost 1 credit. This is to reduce spam. A new network impact will be created for each unique user that rates your challenge.`}
            description="Earn coins information - challenges fine print"
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage={`²A new network impact will be created for each new user that creates an account by using your referral link.`}
            description="Earn coins information - affiliate program fine print"
          />
        </Typography>
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage={`³If a player (B) who was impacted by you (A) goes on to impact another player (C), an impact from A -> C will be created. Up to 5 levels of recursion.`}
            description="Earn coins information - mutual network impacts fine print"
          />
        </Typography>
        <Box mt={1} />
        <Typography variant="caption">
          <FormattedMessage
            defaultMessage={`This credit system is designed to reward players who positively contribute to the game. Credit rewards may change over time.`}
            description="Earn coins information - credit rewards may change"
          />
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
