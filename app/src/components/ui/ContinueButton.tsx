import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useUser } from '@/components/hooks/useUser';
import FlexBox from '@/components/ui/FlexBox';
import isMobile from '@/utils/isMobile';
import Button from '@mui/material/Button';
import { SxProps } from '@mui/material/styles';

interface ContinueButtonProps {
  onClick(): void;
  hotkey: string;
  color?: 'primary' | 'secondary';
  message?: React.ReactNode;
  size?: 'large' | undefined;
  fontSize?: string | undefined;
}

export default function ContinueButton({
  onClick,
  hotkey,
  message,
  size,
  fontSize,
  color = 'primary',
}: ContinueButtonProps) {
  const user = useUser();
  const sx: SxProps = React.useMemo(
    () => ({
      fontSize,
    }),
    [fontSize]
  );
  return (
    <FlexBox>
      <Button
        variant="contained"
        color={color}
        onClick={onClick}
        size={size}
        sx={sx}
      >
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
