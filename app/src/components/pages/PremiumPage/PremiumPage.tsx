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
import Typography from '@mui/material/Typography';
import { useDocument } from 'swr-firestore';
import { getSettingPath, PremiumSettings } from 'infinitris2-models';
import FlexBox from '@/components/ui/FlexBox';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

export function PremiumPage() {
  const intl = useIntl();
  const history = useHistory();
  const title = intl.formatMessage({
    defaultMessage: 'Infinitris Premium',
    description: 'Premium page title',
  });
  const userId = useAuthStore((store) => store.user?.uid);
  const [getPremium, setGetPremium] = React.useState(false);
  const { data: premiumSettings } = useDocument<PremiumSettings>(
    getSettingPath('premium')
  );

  const goToProfile = React.useCallback(() => {
    history.push(Routes.profile);
  }, [history]);

  return (
    <Page title={title} showTitle={false} background={<PremiumCarousel />}>
      <FullPageCarouselTitle>{title}</FullPageCarouselTitle>
      {!userId && getPremium && <Login onLogin={goToProfile} />}
      {!userId && !getPremium && (
        <FlexBox position="absolute" bottom={100}>
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={() => {
              if (
                (premiumSettings?.data()?.freeAccountsRemaining ?? 0) > 0 ||
                window.confirm(
                  'No free accounts remaining, would you like to purchase an account?'
                )
              ) {
                setGetPremium(true);
              }
            }}
          >
            <FormattedMessage
              defaultMessage="Login"
              description="Premium Page - Login"
            />
          </Button>
          {premiumSettings && (
            <Typography variant="caption" mt={1}>
              <FormattedMessage
                defaultMessage="{freeAccountsRemaining} free premium accounts remaining! More in {nextUpdate}"
                description="Premium Page - Free premium"
                values={{
                  freeAccountsRemaining:
                    premiumSettings.data()!.freeAccountsRemaining,
                  nextUpdate: (
                    <CountdownTimer
                      lastUpdateTimestamp={{
                        nanoseconds: 0,
                        seconds:
                          premiumSettings.data()!.lastUpdatedTimestamp.seconds,
                      }}
                      updateIntervalSeconds={
                        24 * 60 * 60 /* update every 24 hours*/
                      }
                    />
                  ),
                }}
              />
            </Typography>
          )}
        </FlexBox>
      )}
    </Page>
  );
}
