import { InputMethod } from 'infinitris2-models';
import { useState } from 'react';
import { useKeyPress, useTimeout } from 'react-use';
import useGestureListener, { Gesture } from './useGestureListener';

export default function useReceivedInput(
  key: string = 'Enter',
  touch: Gesture = Gesture.Touch,
  interactionId: number = 0 // TODO: remove, should design components in a way that does not need to use the same hook twice
): [boolean, InputMethod | undefined] {
  const [lastRetryId, setLastRetryId] = useState<number | undefined>(undefined);
  const isReadyTimeout = 1000 + (interactionId % 2); // force timeout to restart on retry change
  const [isReady] = useTimeout(isReadyTimeout);

  const [isAnyKeyPressed] = useKeyPress(
    (event: KeyboardEvent) => event.key === key
  );
  const hasTapped = useGestureListener(isReadyTimeout, touch, interactionId);
  if (
    (hasTapped || isAnyKeyPressed) &&
    interactionId !== lastRetryId &&
    isReady()
  ) {
    setLastRetryId(interactionId);
  }

  const hasReceivedInput = interactionId === lastRetryId;

  return [
    hasReceivedInput,
    hasReceivedInput ? (hasTapped ? 'touch' : 'keyboard') : undefined,
  ];
}
