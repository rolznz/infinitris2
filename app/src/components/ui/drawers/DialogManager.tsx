import Login from '@/components/ui/Login/Login';
import useDialogStore, {
  closeDialog,
  dialogAnimationLength,
  DialogType,
} from '@/state/DialogStore';
import { Drawer, SvgIcon } from '@mui/material';
import React from 'react';
import { RingIconButton } from '../RingIconButton';
import { CoinInfoDrawerContent } from './CoinInfo/CoinInfoDrawerContent';
import { ImpactInfoDrawerContent } from './ImpactInfo/ImpactInfoDrawerContent';
import { ReactComponent as CrossIcon } from '@/icons/x.svg';
import { ReactComponent as BackIcon } from '@/icons/left.svg';
import FlexBox from '../FlexBox';
import { useHistory } from 'react-router-dom';
import Routes from '@/models/Routes';
import { borderColorDark } from '@/theme/theme';
import shallow from 'zustand/shallow';

export function DialogManager() {
  const history = useHistory();
  const [dialogTypes] = useDialogStore(
    (dialogStore) => [dialogStore.dialogTypes],
    shallow
  );

  const currentDialogType = dialogTypes[dialogTypes.length - 1];

  const onLogin = React.useCallback(() => {
    history.push(Routes.profile);
  }, [history]);

  return (
    <>
      <Drawer
        anchor="bottom"
        open={!!currentDialogType}
        onClose={closeDialog}
        transitionDuration={{
          enter: dialogAnimationLength,
          exit: dialogAnimationLength,
        }}
      >
        {currentDialogType === 'login' && (
          <Login onClose={closeDialog} onLogin={onLogin} />
        )}
        {currentDialogType === 'coinInfo' && <CoinInfoDrawerContent />}
        {currentDialogType === 'impactInfo' && <ImpactInfoDrawerContent />}
        {currentDialogType && (
          <FlexBox mt={2} mb={4}>
            <RingIconButton padding="large" onClick={closeDialog}>
              <SvgIcon sx={{ color: borderColorDark }}>
                {dialogTypes.length === 1 ? <CrossIcon /> : <BackIcon />}
              </SvgIcon>
            </RingIconButton>
          </FlexBox>
        )}
      </Drawer>
    </>
  );
}
