import { Typography } from '@material-ui/core';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import useAppStore from '../state/AppStore';

export default function ContinueHint() {
  const user = useAppStore((appStore) => appStore.user);
  return (
    <Typography variant="caption">
      {user.preferredInputMethod === 'touch' ? (
        <FormattedMessage
          defaultMessage="Tap to continue"
          description="Touchscreen continue text"
        />
      ) : (
        <FormattedMessage
          defaultMessage="Press Enter to continue"
          description="Keyboard continue text"
        />
      )}
    </Typography>
  );
}
