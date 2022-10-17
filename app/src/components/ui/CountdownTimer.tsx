import React from 'react';
import { Timestamp } from 'infinitris2-models';
import { intervalToDuration } from 'date-fns';
import useInterval from 'react-use/lib/useInterval';
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore';

type CountdownTimerProps = {
  lastUpdateTimestamp: Timestamp;
  updateIntervalSeconds: number;
};

export function CountdownTimer({
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
