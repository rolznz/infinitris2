import { Tooltip, IconButton, SvgIcon } from '@mui/material';

import FlexBox from '../../ui/FlexBox';
import { ReactComponent as RefreshIcon } from '@/icons/refresh.svg';
import { colors, dropShadows } from '@/theme/theme';
import useReceivedInput from '@/components/hooks/useReceivedInput';
import React from 'react';
import { useIntl } from 'react-intl';

type RestartButtonProps = {
  onClick(): void;
};

export function RestartButton({ onClick }: RestartButtonProps) {
  const hasReceivedInput = useReceivedInput('r', false);
  const intl = useIntl();
  React.useEffect(() => {
    if (hasReceivedInput) {
      onClick();
    }
  }, [hasReceivedInput, onClick]);
  return (
    <FlexBox style={{ pointerEvents: 'all' }}>
      <Tooltip
        title={intl.formatMessage({
          defaultMessage: 'Restart (r)',
          description: 'Restart challenge button tooltip',
        })}
      >
        <IconButton onClick={onClick} size="large">
          <SvgIcon
            sx={{
              filter: dropShadows.small,
              color: colors.white,
            }}
          >
            <RefreshIcon />
          </SvgIcon>
        </IconButton>
      </Tooltip>
    </FlexBox>
  );
}
