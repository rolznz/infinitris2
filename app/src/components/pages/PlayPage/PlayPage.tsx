import React from 'react';

import { useIntl } from 'react-intl';
import { Page } from '../../ui/Page';
import { PlayTypePicker } from '@/components/ui/GameModePicker/PlayTypePicker';

export default function ScoreboardPage() {
  const intl = useIntl();
  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Scoreboard',
        description: 'Scoreboard page title',
      })}
      useGradient
      paddingX={0}
      paddingY={0}
      showTitle={false}
    >
      <PlayTypePicker display="flex" paddingTop={10} />
    </Page>
  );
}
