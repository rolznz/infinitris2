import React from 'react';
import { SvgIcon, Typography } from '@mui/material';
import { ReactComponent as ImpactIcon } from '@/icons/impact.svg';
import FlexBox from '../../ui/FlexBox';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  getSettingPath,
  IScoreboardEntry,
  scoreboardEntriesPath,
  ScoreboardSettings,
  Timestamp,
} from 'infinitris2-models';
import {
  useCollection,
  UseCollectionOptions,
  useDocument,
} from 'swr-firestore';
import { Page } from '../../ui/Page';
import { ScoreboardCard } from './ScoreboardCard';
import { orderBy } from 'firebase/firestore';
import useAuthStore from '@/state/AuthStore';
import { intervalToDuration } from 'date-fns';
import useInterval from 'react-use/lib/useInterval';
import { PremiumLink } from '@/components/ui/PremiumLink';
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';

const scoreboardCollectionOptions: UseCollectionOptions = {
  constraints: [orderBy('placing', 'asc')],
  listen: true,
};

export default function ScoreboardPage() {
  const intl = useIntl();
  const { data: scoreboardSettings } = useDocument<ScoreboardSettings>(
    getSettingPath('scoreboard')
  );
  const { data: scoreboardEntries } = useCollection<IScoreboardEntry>(
    scoreboardEntriesPath,
    scoreboardCollectionOptions
  );
  const userId = useAuthStore().user?.uid;

  return (
    <Page
      title={intl.formatMessage({
        defaultMessage: 'Scoreboard',
        description: 'Scoreboard page title',
      })}
      useGradient
      paddingX={0}
    >
      {scoreboardSettings && (
        <Typography variant="body1" align="center">
          <FormattedMessage
            defaultMessage="Next update in {nextUpdate}"
            description="Scoreboard page next update message"
            values={{
              nextUpdate: (
                <CountdownTimer
                  lastUpdateTimestamp={{
                    nanoseconds: 0,
                    seconds:
                      scoreboardSettings.data()!.lastUpdatedTimestamp.seconds,
                  }}
                  updateIntervalSeconds={
                    12 * 60 * 60 /* update every 12 hours*/
                  }
                />
              ),
            }}
          />
        </Typography>
      )}
      {!userId && (
        <FlexBox flexDirection="row" gap={1}>
          <SvgIcon fontSize="small">
            <ImpactIcon />
          </SvgIcon>
          <Typography variant="body1" align="center" mt={1}>
            <FormattedMessage
              defaultMessage="{premiumLink} players appear here"
              description="Scoreboard premium players appear here message"
              values={{ premiumLink: <PremiumLink /> }}
            />
          </Typography>
        </FlexBox>
      )}
      {scoreboardEntries && (
        <FlexBox flexDirection="row" flexWrap="wrap" mt={4}>
          {scoreboardEntries?.map((entry) => (
            <ScoreboardCard
              key={entry.id}
              entry={entry}
              placing={entry.data().placing}
            />
          ))}
        </FlexBox>
      )}
    </Page>
  );
}

type CountdownTimerProps = {
  lastUpdateTimestamp: Timestamp;
  updateIntervalSeconds: number;
};

function CountdownTimer({
  lastUpdateTimestamp,
  updateIntervalSeconds,
}: CountdownTimerProps) {
  const [_, setCount] = React.useState(0);
  useInterval(() => setCount((count) => count + 1), 1000);
  return <>{getTimeRemaining(lastUpdateTimestamp, updateIntervalSeconds)}</>;
}

function getTimeRemaining(
  lastUpdateTimestamp: Timestamp,
  updateIntervalSeconds: number,
  repeatable = true
): React.ReactNode {
  let nextTime = lastUpdateTimestamp.seconds;
  while (nextTime < FirestoreTimestamp.now().seconds) {
    nextTime += updateIntervalSeconds;
    if (!repeatable) {
      break;
    }
  }
  const date = new Date(0);
  date.setSeconds(nextTime);

  let duration = intervalToDuration({
    start: new Date(),
    end: date,
  });

  return (
    String(duration.hours).padStart(2, '0') +
    ':' +
    String(duration.minutes).padStart(2, '0') +
    ':' +
    String(duration.seconds).padStart(2, '0')
  );
}
