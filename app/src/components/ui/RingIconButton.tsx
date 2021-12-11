import React from 'react';
import { IconButton } from '@mui/material';

import { borderColor } from '@/theme/theme';

/*const useStyles = makeStyles((theme) => ({
  shareButton: {
    display: 'flex',
  },
  iconButton: {
    backgroundColor: theme.palette.background.paperDark,
    border: `6px solid ${borderColor}`,
  },
  'padding-medium': {
    padding: theme.spacing(1),
  },
  'padding-large': {
    padding: theme.spacing(2),
  },
}));*/

export type RingIconButtonProps = {
  onClick?(): void;
  padding?: 'medium' | 'large';
};

export function RingIconButton({
  children,
  padding = 'medium',
  onClick,
}: React.PropsWithChildren<RingIconButtonProps>) {
  //const classes = useStyles();
  return (
    <IconButton
      //className={`${classes.iconButton} ${classes[`padding-${padding}`]}`}
      onClick={onClick}
      size="large"
    >
      {children}
    </IconButton>
  );
}
