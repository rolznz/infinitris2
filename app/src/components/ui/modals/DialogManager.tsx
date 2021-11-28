import Login from '@/components/Login';
import useDialogStore from '@/state/DialogStore';
import { Drawer } from '@material-ui/core';
import React from 'react';
import CoinInfo from './CoinInfo';

export function DialogManager() {
  const [dialogType, close] = useDialogStore((dialogStore) => [
    dialogStore.dialogType,
    dialogStore.close,
  ]);

  return (
    <>
      <Drawer anchor="bottom" open={!!dialogType} onClose={close}>
        {dialogType === 'login' && <Login onClose={close} />}
        {dialogType === 'coinInfo' && <CoinInfo onClose={close} />}
        {dialogType === 'impactInfo' && <CoinInfo onClose={close} />}
      </Drawer>
    </>
  );
}
