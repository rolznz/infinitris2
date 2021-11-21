import { borderColor } from '@/theme';
import { makeStyles, SvgIcon, SvgIconProps } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  icon: {
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
    borderRadius: '50%',
    padding: 4,
    fontSize: 56,
    marginRight: theme.spacing(1),
    border: `4px solid ${borderColor}`,
    backgroundClip: 'padding-box',
  },
}));

export function FilledIcon({
  children,
  ...otherProps
}: React.PropsWithChildren<SvgIconProps>) {
  const classes = useStyles();
  return (
    <SvgIcon className={classes.icon} {...otherProps}>
      {children}
    </SvgIcon>
  );
}