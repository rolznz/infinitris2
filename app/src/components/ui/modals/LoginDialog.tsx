import React from 'react';
import { FormattedMessage } from 'react-intl';
import CustomDialog from './CustomDialog';
import Login, { loginTitleId } from '../../Login';

interface LoginModalProps {
  isOpen: boolean;
  onClose: Function;
  onLogin?(userId: string): void;
}

export default function LoginDialog({
  isOpen,
  onClose,
  onLogin,
}: LoginModalProps) {
  function handleClose() {
    onClose();
  }
  function handleLogin(userId: string) {
    onLogin?.(userId);
    handleClose();
  }
  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={handleClose}
      dialogId={loginTitleId}
      title={
        <FormattedMessage
          defaultMessage="Login to continue"
          description="Login dialog title"
        />
      }
    >
      <Login onLogin={handleLogin} onClose={handleClose} showTitle={false} />
    </CustomDialog>
  );
}
