import {
  Link,
  ListItem,
  ListItemIcon,
  SvgIcon,
  ListItemText,
} from '@mui/material';

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type HamburgerListItemProps = {
  to?: string;
  icon: React.ReactNode;
  text: React.ReactNode;
  onClick?(): void;
};

/*const useStyles = makeStyles((theme) => ({
  icon: {
    backgroundColor: theme.palette.text.primary,
    color: theme.palette.background.paper,
    borderRadius: '50%',
    padding: 4,
  },
  text: {
    color: theme.palette.text.primary,
    textTransform: 'lowercase',
  },
}));*/

export default function HamburgerListItem({
  to,
  text,
  icon,
  onClick,
}: HamburgerListItemProps) {
  //const classes = useStyles();
  return (
    <Link
      component={RouterLink}
      underline="none"
      to={to || '#'}
      onClick={onClick}
    >
      <ListItem button>
        <ListItemIcon>
          <SvgIcon fontSize="large" /*className={classes.icon}*/>
            {icon}
          </SvgIcon>
        </ListItemIcon>
        <ListItemText primary={text} /*className={classes.text}*/ />
      </ListItem>
    </Link>
  );
}
