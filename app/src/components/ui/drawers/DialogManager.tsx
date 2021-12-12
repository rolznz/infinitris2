import Login from '@/components/Login';
import useDialogStore, {
  dialogAnimationLength,
  DialogType,
} from '@/state/DialogStore';
import { Drawer } from '@mui/material';
import React from 'react';
import { CoinInfoDrawerContent } from './CoinInfo/CoinInfoDrawerContent';
import { ImpactInfoDrawerContent } from './ImpactInfo/ImpactInfoDrawerContent';

export function DialogManager() {
  const [prevDialogType, setPrevDialogType] = React.useState<
    DialogType | undefined
  >(undefined);
  const [dialogType, close] = useDialogStore((dialogStore) => [
    dialogStore.dialogType,
    dialogStore.close,
  ]);

  React.useEffect(() => {
    if (dialogType) {
      setPrevDialogType(dialogType);
    } else {
      setTimeout(
        () => setPrevDialogType(useDialogStore.getState().dialogType),
        dialogAnimationLength
      );
    }
  }, [setPrevDialogType, dialogType]);

  return (
    <>
      <Drawer
        anchor="bottom"
        open={!!dialogType}
        onClose={close}
        transitionDuration={{
          enter: dialogAnimationLength,
          exit: dialogAnimationLength,
        }}
      >
        {prevDialogType === 'login' && <Login onClose={close} />}
        {prevDialogType === 'coinInfo' && (
          <CoinInfoDrawerContent onClose={close} />
        )}
        {prevDialogType === 'impactInfo' && (
          <ImpactInfoDrawerContent onClose={close} />
        )}
      </Drawer>
    </>
  );
}
