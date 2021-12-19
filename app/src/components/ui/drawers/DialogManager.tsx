import Login from '@/components/ui/Login/Login';
import useDialogStore, {
  dialogAnimationLength,
  DialogType,
} from '@/state/DialogStore';
import { Drawer, SvgIcon } from '@mui/material';
import React from 'react';
import { RingIconButton } from '../RingIconButton';
import { CoinInfoDrawerContent } from './CoinInfo/CoinInfoDrawerContent';
import { ImpactInfoDrawerContent } from './ImpactInfo/ImpactInfoDrawerContent';
import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import FlexBox from '../FlexBox';
import { useHistory } from 'react-router-dom';
import Routes from '@/models/Routes';
import { borderColorDark } from '@/theme/theme';
import { GameModePicker } from '../GameModePicker/GameModePicker';

export function DialogManager() {
  const [prevDialogType, setPrevDialogType] = React.useState<
    DialogType | undefined
  >(undefined);
  const history = useHistory();
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

  const onLogin = React.useCallback(() => {
    history.push(Routes.profile);
  }, [history]);

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
        {prevDialogType === 'login' && (
          <Login onClose={close} onLogin={onLogin} />
        )}
        {prevDialogType === 'coinInfo' && (
          <CoinInfoDrawerContent onClose={close} />
        )}
        {prevDialogType === 'impactInfo' && (
          <ImpactInfoDrawerContent onClose={close} />
        )}
        {prevDialogType === 'gameModePicker' && (
          <GameModePicker onClose={close} />
        )}
        {prevDialogType && (
          <FlexBox mt={2} mb={4}>
            <RingIconButton padding="large" onClick={close}>
              <SvgIcon sx={{ color: borderColorDark }}>
                <CrossIcon />
              </SvgIcon>
            </RingIconButton>
          </FlexBox>
        )}
      </Drawer>
    </>
  );
}
