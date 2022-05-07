import { openLoginDialog } from '@/state/DialogStore';
import { IntlShape } from 'react-intl';
import { toast } from 'react-toastify';

export function showLoginPrompt(intl: IntlShape) {
  toast(
    intl.formatMessage({
      defaultMessage: 'Please login',
      description: 'Please login to continue toast message',
    }),
    {}
  );
  openLoginDialog();
}
