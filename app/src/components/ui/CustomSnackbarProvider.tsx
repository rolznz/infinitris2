import { SnackbarProvider } from 'notistack';
import React from 'react';
import { fontFamily } from 'infinitris2-models';
import { borderRadiuses } from '@/theme/theme';
function _CustomSnackbarProvider({ children }: React.PropsWithChildren<{}>) {
  console.log('Render CustomSnackbarProvider');
  return (
    <SnackbarProvider
      maxSnack={3}
      variant="success"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      style={{
        fontFamily,
        borderRadius: borderRadiuses.full,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}

export const CustomSnackbarProvider = React.memo(
  _CustomSnackbarProvider,
  () => true
);
