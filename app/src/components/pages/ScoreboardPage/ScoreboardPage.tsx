import React from 'react';
import { Box, Card, Typography } from '@material-ui/core';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage } from 'react-intl';
import { IScoreboardEntry, scoreboardEntriesPath } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { Page } from '../../ui/Page';
import { ScoreboardCard } from './ScoreboardCard';

export default function ScoreboardPage() {
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath
  );

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Scoreboard"
          description="Scoreboard page title"
        />
      }
    >
      <Typography variant="body1" align="center">
        <FormattedMessage
          defaultMessage="Updates once a day"
          description="Scoreboard page updates message"
        />
      </Typography>
      {scoreboardEntries && (
        <FlexBox flexDirection="row" flexWrap="wrap" mt={4}>
          {scoreboardEntries?.map((entry) => (
            <ScoreboardCard key={entry.id} entry={entry} />
          ))}
        </FlexBox>
      )}
    </Page>
  );
}
