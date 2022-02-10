import { Typography } from '@mui/material';
import { Page } from '../../ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';
import { appName } from '@/utils/constants';
import homescreenImage from './assets/pwa2.png';
import iosShareImage from './assets/ios_share.jpg';
import iosAddToHomescreenImage from './assets/ios_add_to_homescreen.jpg';
import { isAndroid, isIos } from '@/utils/isMobile';

export function PwaPage() {
  const intl = useIntl();
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Get the App to continue',
        description: 'PWA page title',
      })}
      style={{ height: '100%', justifyContent: 'center' }}
    >
      <img src={homescreenImage} alt="friend" width="100%" />

      <Typography mt={4} mb={4}>
        {isIos() ? (
          <FormattedMessage
            defaultMessage="In Safari, press the share button {iosShareImage} and then tap 'add to homescreen' {iosHomescreenImage}"
            description="PWA page iOS instructions"
            values={{
              appName,
              iosShareImage: (
                <img
                  src={iosShareImage}
                  alt="friend"
                  width="100%"
                  style={{ marginTop: '10px', marginBottom: '10px' }}
                />
              ),
              iosHomescreenImage: (
                <img
                  src={iosAddToHomescreenImage}
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
