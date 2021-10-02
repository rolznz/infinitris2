import React from 'react';
import { Box, Typography } from '@material-ui/core';

import FlexBox from '../ui/FlexBox';
import { FormattedMessage } from 'react-intl';
import { IScoreboardEntry, scoreboardEntriesPath } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { Page } from '../ui/Page';

export default function ScoreboardPage() {
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath
  );

  /*const columns: GridColDef[] = [
    { field: 'nickname', headerName: 'Player', width: 150, sortable: false },
    { field: 'coins', headerName: 'Coins', width: 130 },
    { field: 'networkImpact', headerName: 'Network Impact', width: 170 },
    { field: 'numBlocksPlaced', headerName: 'Blocks Placed', width: 160 },
    {
      field: 'numCompletedChallenges',
      headerName: 'Challenges Completed',
      width: 200,
    },
  ];*/

  return (
    <Page
      title={
        <FormattedMessage
          defaultMessage="Scoreboard"
          description="Scoreboard page title"
        />
      }
    >
      <FlexBox
        flex={1}
        justifyContent="flex-start"
        maxWidth={500}
        width="100%"
        marginX="auto"
      >
        <Typography variant="body1" align="center">
          <FormattedMessage
            defaultMessage="Updates once a day"
            description="Scoreboard page updates message"
          />
        </Typography>
        {scoreboardEntries && (
          <Box width="90vw" maxWidth={1000} flex={1} mt={4}>
            {/*<DataGrid
              sortingOrder={['desc', 'asc']}
              sortModel={[
                {
                  field: 'coins',
                  sort: 'desc',
                },
              ]}
              rows={scoreboardEntries}
              columns={columns}
              pageSize={10}
              autoHeight
            />*/}
          </Box>
        )}
      </FlexBox>
    </Page>
  );
}
