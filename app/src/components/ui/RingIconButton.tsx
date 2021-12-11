import React from 'react';
import { IconButton } from '@mui/material';

import makeStyles from '@mui/styles/makeStyles';

import { borderColor } from '@/theme';

const useStyles = makeStyles((theme) => ({
  shareButton: {
    display: 'flex',
  },
  iconButton: {
    backgroundColor: theme.palette.background.paperDark,
    border: `6px solid ${borderColor}`,
  },
  /*inverted: {
    border: `6px solid ${borderColor}`,
    backgroundColor: theme.palette.primary.contrastText,
    '& svg': {
      color: theme.palette.background.paperDark,
    },
  },*/
  'padding-medium': {
    padding: theme.spacing(1),
  },
  'padding-large': {
    padding: theme.spacing(2),
  },
}));

export type RingIconButtonProps = {
  onClick?(): void;
  padding?: 'medium' | 'large';
};

export function RingIconButton({
  children,
  padding = 'medium',
  onClick,
}: React.PropsWithChildren<RingIconButtonProps>) {
  const classes = useStyles();
  return (
    <IconButton
      className={`${classes.iconButton} ${classes[`padding-${padding}`]}`}
      onClick={onClick}
      size="large">
      {children}
    </IconButton>
  );
}
