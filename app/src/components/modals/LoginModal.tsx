import { Modal } from '@material-ui/core';
import React from 'react';
import Login, { loginTitleId } from '../Login';

interface LoginModalProps {
  isOpen: boolean;
  onClose: Function;
  onLogin?(userId: string): void;
}

export default function LoginModal({
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
    <Modal open={isOpen} onClose={handleClose} aria-labelledby={loginTitleId}>
      <Login onLogin={handleLogin} />
    </Modal>
  );
}
