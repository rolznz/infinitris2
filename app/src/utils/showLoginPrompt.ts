import { EnqueueSnackbarFunction } from '@/components/ui/Snackbar';
import { appName } from '@/utils/constants';
import { IntlShape } from 'react-intl';

export function showLoginPrompt(
  enqueueSnackbar: EnqueueSnackbarFunction,
  intl: IntlShape
) {
  enqueueSnackbar(
    intl.formatMessage(
      {
        defaultMessage: '{appName} Premium Required',
        description: 'Infinitris Premium required toast message',
      },
      { appName }
    ),
    {
      variant: 'warning',
    }
  );
}
