import Routes from '@/models/Routes';
import { appName } from '@/utils/constants';
import Link from '@mui/material/Link';
import { FormattedMessage } from 'react-intl';
import { Link as RouterLink } from 'react-router-dom';

export function PremiumLink() {
  return (
    <Link component={RouterLink} to={Routes.premium}>
      <FormattedMessage
        defaultMessage="{appName} Premium"
        description="Infinitris Premium"
        values={{ appName }}
      />
    </Link>
  );
}
