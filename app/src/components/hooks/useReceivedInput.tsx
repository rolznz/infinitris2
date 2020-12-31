import { InputMethod } from 'infinitris2-models';
import React from 'react';
import { useKeyPress, useTimeout } from 'react-use';
import useTapListener from './useTapListener';

export default function useReceivedInput(): [boolean, InputMethod | undefined] {
  const isReadyTimeout = 1000;
  const [isReady] = useTimeout(isReadyTimeout);
  const [isAnyKeyPressed] = useKeyPress((event) =>
    Boolean(isReady() && event.key === 'Enter')
  );
  const hasTapped = useTapListener(isReadyTimeout);
  const [hasReceivedInput, setHasReceivedInput] = React.useState(false);

  if ((hasTapped || isAnyKeyPressed) && !hasReceivedInput) {
    setHasReceivedInput(true);
  }

  return [
    hasReceivedInput,
    hasReceivedInput ? (hasTapped ? 'touch' : 'keyboard') : undefined,
  ];
}
