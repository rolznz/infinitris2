import React from 'react';
import { Page } from '@/components/ui/Page';
import { FormattedMessage, useIntl } from 'react-intl';
import { PremiumCarousel } from '@/components/pages/PremiumPage/PremiumCarousel';
import { FullPageCarouselTitle } from '@/components/ui/FullPageCarouselTitle';
import Login from '@/components/ui/Login/Login';
import Routes from '@/models/Routes';
import { useHistory } from 'react-router-dom';
import useAuthStore from '@/state/AuthStore';
import Button from '@mui/material/Button/Button';
const PREMIUM_ENABLED = false;

export function PremiumPage() {
  const intl = useIntl();
  const history = useHistory();
  const title = intl.formatMessage({
    defaultMessage: 'Infinitris Premium',
    description: 'Premium page title',
  });
  const userId = useAuthStore((store) => store.user?.uid);
  const [getPremium, setGetPremium] = React.useState(false);

  const goToProfile = React.useCallback(() => {
    history.push(Routes.profile);
  }, [history]);

  return (
    <Page title={title} showTitle={false} background={<PremiumCarousel />}>
      <FullPageCarouselTitle>{title}</FullPageCarouselTitle>
      {!userId && getPremium && <Login onLogin={goToProfile} />}
      {!userId && !getPremium && PREMIUM_ENABLED && (
        <Button
          color="primary"
          variant="contained"
          size="large"
          onClick={() => setGetPremium(true)}
          sx={{
            position: 'absolute',
            bottom: 100,
          }}
        >
          <FormattedMessage
            defaultMessage="Get Premium"
            description="Premium Page - Get Premium"
          />
        </Button>
      )}
    </Page>
  );
}
