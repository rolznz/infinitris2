import { colors } from '@/theme/theme';
import {
  Link,
  ListItem,
  ListItemIcon,
  SvgIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

type HamburgerListItemProps = {
  to?: string;
  icon: React.ReactNode;
  text: React.ReactNode;
  premium?: boolean;
  onClick?(): void;
};

export default function HamburgerListItem({
  to,
  text,
  icon,
  premium,
  onClick,
}: HamburgerListItemProps) {
  return (
    <Link
      component={RouterLink}
      underline="none"
      to={to || '#'}
      onClick={onClick}
    >
      <ListItem button>
        <ListItemIcon>
          <SvgIcon
            fontSize="large"
            sx={{
              backgroundColor: 'text.primary',
              color: 'background.paper',
              borderRadius: '50%',
              padding: 0.5,
            }}
          >
            {icon}
          </SvgIcon>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              sx={{ color: premium ? colors.premium : 'text.primary' }}
            >
              {text}
            </Typography>
          }
          disableTypography
        />
      </ListItem>
    </Link>
  );
}
