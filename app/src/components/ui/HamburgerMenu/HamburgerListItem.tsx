import {
  Link,
  ListItem,
  ListItemIcon,
  SvgIcon,
  ListItemText,
} from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type HamburgerListItemProps = {
  to: string;
  icon: React.ReactNode;
  text: React.ReactNode;
};

export default function HamburgerListItem({
  to,
  text,
  icon,
}: HamburgerListItemProps) {
  return (
    <Link component={RouterLink} underline="none" to={to}>
      <ListItem button>
        <ListItemIcon>
          <SvgIcon>{icon}</SvgIcon>
        </ListItemIcon>
        <ListItemText primary={text} />
      </ListItem>
    </Link>
  );
}
