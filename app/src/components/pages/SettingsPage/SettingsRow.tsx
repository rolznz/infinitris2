import { Grid, Typography } from '@mui/material';
import React from 'react';
import FlexBox from '../../ui/FlexBox';

interface SettingsRowProps {
  left: React.ReactNode;
  right: React.ReactNode;
}
export default function SettingsRow({ left, right }: SettingsRowProps) {
  return (
    <>
      <Grid item xs={7}>
        <FlexBox alignItems="flex-start">
          <Typography color="textPrimary" variant="body1">
            {left}
          </Typography>
        </FlexBox>
      </Grid>
      <Grid item xs={5}>
        <FlexBox>{right}</FlexBox>
      </Grid>
    </>
  );
}
