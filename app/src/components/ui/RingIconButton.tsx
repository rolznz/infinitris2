import React from 'react';
import { IconButton } from '@mui/material';

import { borderColor } from '@/theme/theme';

export type RingIconButtonProps = {
  onClick?(): void;
  padding?: 'medium' | 'large' | 'none';
  borderWidth?: number;
};

export function RingIconButton({
  children,
  padding = 'medium',
  borderWidth = 6,
  onClick,
}: React.PropsWithChildren<RingIconButtonProps>) {
  return (
    <IconButton
      onClick={onClick}
      size="large"
      sx={{
        backgroundColor: 'background.paperDark',
        border: `${borderWidth}px solid ${borderColor}`,
        padding: padding === 'none' ? 0 : padding === 'medium' ? 1 : 2,
      }}
    >
      {children}
    </IconButton>
  );
}
