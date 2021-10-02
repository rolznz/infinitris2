import React from 'react';
import { IconButton, makeStyles } from '@material-ui/core';

import { borderColor } from '@/theme';

const useStyles = makeStyles((theme) => ({
  shareButton: {
    display: 'flex',
  },
  iconButton: {
    backgroundColor: theme.palette.background.paperDark,
    border: `6px solid ${borderColor}`,
  },
}));

export function RingIconButton(props: React.PropsWithChildren<{}>) {
  const classes = useStyles();
  return (
    <IconButton className={classes.iconButton}>{props.children}</IconButton>
  );
}
