import React from 'react';
import { Typography } from '@mui/material';

import FlexBox from '../../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';
import { IScoreboardEntry, scoreboardEntriesPath } from 'infinitris2-models';
import { useCollection, UseCollectionOptions } from 'swr-firestore';
import { Page } from '../../ui/Page';
import { ScoreboardCard } from './ScoreboardCard';
import { orderBy } from 'firebase/firestore';

const scoreboardCollectionOptions: UseCollectionOptions = {
  constraints: [orderBy('networkImpact', 'desc')],
};

export default function ScoreboardPage() {
  const intl = useIntl();
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath,
    scoreboardCollectionOptions
  );

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
      {scoreboardEntries && (
        <FlexBox flexDirection="row" flexWrap="wrap" mt={4}>
          {scoreboardEntries?.map((entry, index) => (
            <ScoreboardCard key={entry.id} entry={entry} placing={index + 1} />
          ))}
        </FlexBox>
      )}
    </Page>
  );
}
