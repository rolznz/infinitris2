import { Typography } from '@mui/material';
import { Page } from '../ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';
import { appName } from '@/utils/constants';
import AddBoxIcon from '@mui/icons-material/AddBox';

export function PwaPage() {
  const intl = useIntl();
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Add to Homescreen',
        description: 'PWA page title',
      })}
      style={{ height: '100%', justifyContent: 'center' }}
    >
      <Typography>
        <FormattedMessage
          defaultMessage="{appName} does not work well in mobile browsers. Please save this page to your home screen to continue."
          description="PWA infinitris does not work well in mobile browsers"
          values={{ appName }}
        />
      </Typography>
      <AddBoxIcon
        color="primary"
        sx={{
          my: 4,
          fontSize: 40,
        }}
      />

      <Typography mb={1}>
        <FormattedMessage
          defaultMessage="iOS: In Safari, press the share button and then add to homescreen"
          description="PWA page iOS instructions"
          values={{ appName }}
        />
      </Typography>
      <Typography mb={1}>
        <FormattedMessage
          defaultMessage="Android: In Chrome, tap the menu icon (3 dots in upper right-hand corner) and tap Add to homescreen"
          description="PWA page Android instructions"
          values={{ appName }}
        />
      </Typography>
    </Page>
  );
}
