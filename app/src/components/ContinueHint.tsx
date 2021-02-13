import { Typography } from '@material-ui/core';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '../state/UserStore';

interface ContinueHintProps {
  showContextMenu?: boolean;
}

export default function ContinueHint({
  showContextMenu = false,
}: ContinueHintProps) {
  const user = useUser();
  return (
    <>
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
      {showContextMenu /*TODO: move to another component? */ && (
        <>
          <br />
          <Typography variant="caption">
            {user.preferredInputMethod === 'touch' ? (
              <FormattedMessage
                defaultMessage="Long press to retry or leave feedback"
                description="Touchscreen context menu text (retry, feedback, etc)"
              />
            ) : (
              <FormattedMessage
                defaultMessage="R to retry, F for feedback"
                description="Keyboard context menu text (retry, feedback, etc)"
              />
            )}
          </Typography>
        </>
      )}
    </>
  );
}
