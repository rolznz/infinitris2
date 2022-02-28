import { Typography } from '@mui/material';
import { Page } from '../../ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';
import { appName } from '@/utils/constants';
import homescreenImageLight from './assets/app_homescreen_light.png';
import iosShareImageLight from './assets/app_share_light.png';
import iosAddToHomescreenImageLight from './assets/app_add_light.png';
import homescreenImageDark from './assets/app_homescreen_dark.png';
import iosShareImageDark from './assets/app_share_dark.png';
import iosAddToHomescreenImageDark from './assets/app_add_dark.png';
import { isAndroid, isIos } from '@/utils/isMobile';
import useDarkMode from '@/components/hooks/useDarkMode';

export function PwaPage() {
  const intl = useIntl();
  const isDarkMode = useDarkMode();
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Get the App to continue',
        description: 'PWA page title',
      })}
      style={{ height: '100%', justifyContent: 'center' }}
    >
      <img
        src={isDarkMode ? homescreenImageDark : homescreenImageLight}
        alt="friend"
        width="100%"
      />

      <Typography mt={4} mb={4}>
        {isIos() ? (
          <FormattedMessage
            defaultMessage="In Safari, press the share button {iosShareImage} and then tap 'add to homescreen' {iosHomescreenImage}"
            description="PWA page iOS instructions"
            values={{
              appName,
              iosShareImage: (
                <img
                  src={isDarkMode ? iosShareImageDark : iosShareImageLight}
                  alt="friend"
                  width="100%"
                  style={{ marginTop: '10px', marginBottom: '10px' }}
                />
              ),
              iosHomescreenImage: (
                <img
                  src={
                    isDarkMode
                      ? iosAddToHomescreenImageDark
                      : iosAddToHomescreenImageLight
                  }
                  alt="friend"
                  width="100%"
                  style={{ marginTop: '10px', marginBottom: '10px' }}
                />
              ),
            }}
          />
        ) : isAndroid() ? (
          <FormattedMessage
            defaultMessage="In Chrome, tap the menu icon (3 dots in upper right-hand corner) and tap 'add to homescreen'"
            description="PWA page Android instructions"
            values={{ appName }}
          />
        ) : (
          <FormattedMessage
            defaultMessage="Please add this website to your homescreen"
            description="PWA generic instructions"
            values={{ appName }}
          />
        )}
      </Typography>
    </Page>
  );
}
