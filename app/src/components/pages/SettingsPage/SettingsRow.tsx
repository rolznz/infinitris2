import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import FlexBox from '../../layout/FlexBox';

interface SettingsRowProps {
  left: React.ReactNode;
  right: React.ReactNode;
}
export default function SettingsRow({ left, right }: SettingsRowProps) {
  return (
    <>
      <Grid item xs={7}>
        <FlexBox alignItems="flex-start">
          <Typography variant="body1">{left}</Typography>
        </FlexBox>
      </Grid>
      <Grid item xs={5}>
        <FlexBox>{right}</FlexBox>
      </Grid>
    </>
  );
}
