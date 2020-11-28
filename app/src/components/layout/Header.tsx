import { Box, IconButton, Link, Tooltip } from '@material-ui/core';
import React from 'react';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import { Link as RouterLink } from 'react-router-dom';

export default function Header() {
  return (
    <Box
      width="100%"
      zIndex={1}
      justifyContent="flex-end"
      display="flex"
      alignItems="center"
    >
      <Tooltip title="Single Player">
        <Link component={RouterLink} underline="none" to="/rooms/singleplayer">
          <IconButton>
            <SportsEsportsIcon />
          </IconButton>
        </Link>
      </Tooltip>
    </Box>
  );
}
