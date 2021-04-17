import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';

import FlexBox from '../layout/FlexBox';
import { FormattedMessage } from 'react-intl';
import { IScoreboardEntry } from 'infinitris2-models';
import { useCollection } from '@nandorojo/swr-firestore';
import { scoreboardEntriesPath } from '@/firebase';

export default function ScoreboardPage() {
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath
  );

  return (
    <FlexBox flex={1} justifyContent="flex-start" maxWidth={500} marginX="auto">
      <Typography variant="h1" align="center">
        <FormattedMessage
          defaultMessage="Scoreboard"
          description="Scoreboard page title"
        />
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Completed Challenges</TableCell>
              <TableCell align="right">Network Impact</TableCell>
              <TableCell align="right">Credits</TableCell>
              <TableCell align="right">Number of Blocks Placed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scoreboardEntries?.map((scoreboardEntry) => (
              <TableRow key={scoreboardEntry.nickname}>
                <TableCell component="th" scope="row">
                  {scoreboardEntry.nickname}
                </TableCell>
                <TableCell align="right">
                  {scoreboardEntry.numCompletedChallenges}
                </TableCell>
                <TableCell align="right">
                  {scoreboardEntry.networkImpact}
                </TableCell>
                <TableCell align="right">{scoreboardEntry.credits}</TableCell>
                <TableCell align="right">
                  {scoreboardEntry.numBlocksPlaced}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </FlexBox>
  );
}
