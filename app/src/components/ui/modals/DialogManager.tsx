import Login from '@/components/Login';
import useDialogStore from '@/state/DialogStore';
import isMobile from '@/utils/isMobile';
import { Drawer } from '@material-ui/core';
import React from 'react';
import LoginDialog from './LoginDialog';

export function DialogManager() {
  const [dialogType, close] = useDialogStore((dialogStore) => [
    dialogStore.dialogType,
    dialogStore.close,
  ]);

  // TODO: remove LoginDialog
  return (
    <>
      {isMobile() ? (
        <Drawer anchor="bottom" open={dialogType === 'login'} onClose={close}>
          <Login onClose={close} />
        </Drawer>
      ) : (
        <LoginDialog isOpen={dialogType === 'login'} onClose={close} />
      )}
    </>
  );
}
