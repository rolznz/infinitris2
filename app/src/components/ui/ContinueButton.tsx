import { Button } from '@mui/material';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '@/components/hooks/useUser';
import FlexBox from '@/components/ui/FlexBox';
import isMobile from '@/utils/isMobile';

interface ContinueButtonProps {
  onClick(): void;
  hotkey: string;
  color?: 'primary' | 'secondary';
  message?: React.ReactNode;
}

export default function ContinueButton({
  onClick,
  hotkey,
  message,
  color = 'primary',
}: ContinueButtonProps) {
  const user = useUser();
  return (
    <FlexBox>
      <Button variant="contained" color={color} onClick={onClick}>
        {message || (
          <FormattedMessage
            defaultMessage="Continue"
            description="Continue button text"
          />
        )}
        {!isMobile() &&
          (user.preferredInputMethod || 'keyboard') === 'keyboard' && (
            <>&nbsp; ({hotkey})</>
          )}
      </Button>
    </FlexBox>
  );
}
