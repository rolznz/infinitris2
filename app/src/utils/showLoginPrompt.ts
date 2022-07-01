import { EnqueueSnackbarFunction } from '@/components/ui/Snackbar';
import { openLoginDialog } from '@/state/DialogStore';
import { IntlShape } from 'react-intl';

export function showLoginPrompt(
  enqueueSnackbar: EnqueueSnackbarFunction,
  intl: IntlShape
) {
  enqueueSnackbar(
    intl.formatMessage({
      defaultMessage: 'Please login',
      description: 'Please login to continue toast message',
    }),
    {
      variant: 'info',
    }
  );
  openLoginDialog();
}
