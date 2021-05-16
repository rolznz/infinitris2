import React from 'react';
import { Box, Typography } from '@material-ui/core';

import FlexBox from '../ui/FlexBox';
import { FormattedMessage } from 'react-intl';
import { IScoreboardEntry } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { scoreboardEntriesPath } from '@/firebase';
import { DataGrid, GridColDef } from '@material-ui/data-grid';

export default function ScoreboardPage() {
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath
  );

  const columns: GridColDef[] = [
    { field: 'nickname', headerName: 'Player', width: 150, sortable: false },
    { field: 'credits', headerName: 'Credits', width: 130 },
    { field: 'networkImpact', headerName: 'Network Impact', width: 170 },
    { field: 'numBlocksPlaced', headerName: 'Blocks Placed', width: 160 },
    {
      field: 'numCompletedChallenges',
      headerName: 'Challenges Completed',
      width: 200,
    },
  ];

  return (
    <FlexBox
      flex={1}
      justifyContent="flex-start"
      maxWidth={500}
      width="100%"
      marginX="auto"
    >
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Scoreboard"
          description="Scoreboard page title"
        />
      </Typography>
      <Typography variant="body1" align="center">
        <FormattedMessage
          defaultMessage="Updates once a day"
          description="Scoreboard page updates message"
        />
      </Typography>
      {scoreboardEntries && (
        <Box width="90vw" maxWidth={1000} flex={1} mt={4}>
          <DataGrid
            sortingOrder={['desc', 'asc']}
            sortModel={[
              {
                field: 'credits',
                sort: 'desc',
              },
            ]}
            rows={scoreboardEntries}
            columns={columns}
            pageSize={10}
            autoHeight
          />
        </Box>
      )}
    </FlexBox>
  );
}
