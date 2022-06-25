import { IconButton, SvgIcon, Tooltip } from '@mui/material';

import FlexBox from './FlexBox';
import { ReactComponent as HomeIcon } from '@/icons/home.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors, dropShadows } from '@/theme/theme';
import { exitFullscreen } from '@/utils/launchFullscreen';
import { useIsNavigationButtonVisible } from '@/components/hooks/useIsNavigationButtonVisible';
import { Link } from 'react-router-dom';
import Routes from '@/models/Routes';
import { useIntl } from 'react-intl';
import useRouterStore from '@/state/RouterStore';

const onClick = () => {
  exitFullscreen();
  playSound(SoundKey.click);
};

export default function HomeButton() {
  const intl = useIntl();
  const isHome = useRouterStore((store) => store.length) === 0;
  const isHomeButtonVisible = useIsNavigationButtonVisible() && isHome;
  if (!isHomeButtonVisible) {
    return null;
  }
  return (
    <FlexBox style={{ pointerEvents: 'all' }}>
      <Link to={Routes.home}>
        <Tooltip
          title={intl.formatMessage({
            defaultMessage: 'Home',
            description: 'Home button tooltip',
          })}
        >
          <IconButton onClick={onClick} size="large">
            <SvgIcon
              sx={{
                filter: dropShadows.small,
                color: colors.white,
              }}
            >
              <HomeIcon />
            </SvgIcon>
          </IconButton>
        </Tooltip>
      </Link>
    </FlexBox>
  );
}
