import React from 'react';
import { Button, Typography } from '@mui/material';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';
import { IScoreboardEntry, scoreboardEntriesPath } from 'infinitris2-models';
import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { Page } from '../../ui/Page';
import { ScoreboardCard } from './ScoreboardCard';
import { orderBy } from 'firebase/firestore';
import { openLoginDialog } from '@/state/DialogStore';
import useAuthStore from '@/state/AuthStore';

const scoreboardCollectionOptions: UseCollectionOptions = {
  constraints: [orderBy('placing', 'asc')],
};

export default function ScoreboardPage() {
  const intl = useIntl();
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath,
    scoreboardCollectionOptions
  );
  const userId = useAuthStore().user?.uid;

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Scoreboard',
        description: 'Scoreboard page title',
      })}
      useGradient
      paddingX={0}
    >
      <Typography variant="body1" align="center">
        <FormattedMessage
          defaultMessage="Updates once a day"
          description="Scoreboard page updates message"
        />
      </Typography>
      {!userId && (
        <FlexBox>
          <Typography variant="body1" align="center">
            <FormattedMessage
              defaultMessage="Register to appear here"
              description="Scoreboard page register to appear message"
            />
          </Typography>
          <Button
            color="primary"
            variant="contained"
            onClick={() => openLoginDialog()}
          >
            <FormattedMessage
              defaultMessage="Log in"
              description="User Profile Page - login button"
            />
          </Button>
        </FlexBox>
      )}
      {scoreboardEntries && (
        <FlexBox flexDirection="row" flexWrap="wrap" mt={4}>
          {scoreboardEntries?.map((entry) => (
            <ScoreboardCard
              key={entry.id}
              entry={entry}
              placing={entry.data().placing}
            />
          ))}
        </FlexBox>
      )}
    </Page>
  );
}
