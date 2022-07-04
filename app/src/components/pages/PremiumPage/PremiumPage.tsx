import React from 'react';
import { Page } from '@/components/ui/Page';
import { useIntl } from 'react-intl';
import { PremiumCarousel } from '@/components/pages/PremiumPage/PremiumCarousel';

export function PremiumPage() {
  const intl = useIntl();

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Infinitris Premium',
        description: 'Premium page title',
      })}
      whiteTitle
      background={<PremiumCarousel />}
    />
  );
}
