import { IconButton, SvgIcon, Tooltip } from '@mui/material';

import FlexBox from './FlexBox';
import { ReactComponent as HomeIcon } from '@/icons/home.svg';
import { playSound, SoundKey } from '@/sound/SoundManager';
import { colors, dropShadows } from '@/theme/theme';
import { exitFullscreen } from '@/utils/launchFullscreen';
import { useIsHomeButtonVisible } from '@/components/hooks/useIsHomeButtonVisible';
import { Link } from 'react-router-dom';
import Routes from '@/models/Routes';
import { useIntl } from 'react-intl';

export default function HomeButton() {
  const intl = useIntl();
  const isBackButtonVisible = useIsHomeButtonVisible();
  if (!isBackButtonVisible) {
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
          <IconButton
            style={{}}
            onClick={() => {
              exitFullscreen();
              playSound(SoundKey.click);
            }}
            size="large"
          >
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
