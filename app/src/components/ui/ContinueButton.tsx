import { Button, Typography } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '@/state/UserStore';
import FlexBox from '@/components/ui/FlexBox';

interface ContinueButtonProps {
  onClick(): void;
}

export default function ContinueButton({ onClick }: ContinueButtonProps) {
  const user = useUser();
  return (
    <FlexBox>
      <Button variant="contained" color="secondary" onClick={onClick}>
        <FormattedMessage
          defaultMessage="Continue"
          description="Continue button text"
        />
      </Button>
      {user.preferredInputMethod === 'keyboard' && (
        <Typography variant="caption" mt={1}>
          <FormattedMessage
            defaultMessage="Press Enter to continue"
            description="Keyboard continue text"
          />
        </Typography>
      )}
    </FlexBox>
  );
}
