import { InputMethod } from 'infinitris2-models';
import { useState } from 'react';
import { useKeyPress, useTimeout } from 'react-use';
import useTapListener from './useTapListener';

export default function useReceivedInput(
  retryId: number = 0
): [boolean, InputMethod | undefined] {
  const [lastRetryId, setLastRetryId] = useState<number | undefined>(undefined);
  const isReadyTimeout = 1000 + (retryId % 2); // force timeout to restart on retry change
  const [isReady] = useTimeout(isReadyTimeout);

  const [isAnyKeyPressed] = useKeyPress(
    (event: KeyboardEvent) => event.key === 'Enter'
  );
  const hasTapped = useTapListener(isReadyTimeout, retryId);
  if ((hasTapped || isAnyKeyPressed) && retryId !== lastRetryId && isReady()) {
    setLastRetryId(retryId);
  }

  const hasReceivedInput = retryId === lastRetryId;

  return [
    hasReceivedInput,
    hasReceivedInput ? (hasTapped ? 'touch' : 'keyboard') : undefined,
  ];
}
