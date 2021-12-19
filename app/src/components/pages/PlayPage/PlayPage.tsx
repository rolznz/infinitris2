import React from 'react';

import { useIntl } from 'react-intl';
import { Page } from '../../ui/Page';
import { GameModePicker } from '@/components/ui/GameModePicker/GameModePicker';

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
      <GameModePicker display="flex" paddingTop={10} />
    </Page>
  );
}
