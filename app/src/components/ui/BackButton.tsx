import { IconButton, SvgIcon, Tooltip } from '@mui/material';

import FlexBox from './FlexBox';
import { ReactComponent as LeftIcon } from '@/icons/left.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors, dropShadows } from '@/theme/theme';
//import { exitFullscreen } from '@/utils/launchFullscreen';
import { useIsNavigationButtonVisible } from '@/components/hooks/useIsNavigationButtonVisible';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import useRouterStore from '@/state/RouterStore';
//import useReceivedInput from '@/components/hooks/useReceivedInput';
import React from 'react';

export default function BackButton() {
  const intl = useIntl();
  const history = useHistory();
  const isHome = useRouterStore((store) => store.length) === 0;
  const isBackButtonVisible = useIsNavigationButtonVisible() && !isHome;
  // FIXME: keyboard hotkey should only be enabled when ingame and not chatting
  //const hasReceivedInput = useReceivedInput('b', false);
  const onClick = React.useCallback(() => {
    history.goBack();
    playSound(SoundKey.click);
  }, [history]);

  /*React.useEffect(() => {
    if (hasReceivedInput) {
      onClick();
    }
  }, [hasReceivedInput, onClick]);*/

  if (!isBackButtonVisible) {
    return null;
  }
  return (
    <FlexBox style={{ pointerEvents: 'all' }}>
      <Tooltip
        title={intl.formatMessage({
          defaultMessage: 'Back' /* (b)*/,
          description: 'Back button tooltip',
        })}
      >
        <IconButton onClick={onClick} size="large">
          <SvgIcon
            sx={{
              filter: dropShadows.small,
              color: colors.white,
            }}
          >
            <LeftIcon />
          </SvgIcon>
        </IconButton>
      </Tooltip>
    </FlexBox>
  );
}
