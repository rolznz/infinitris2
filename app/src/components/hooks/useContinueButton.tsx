import React from 'react';
import { useState } from 'react';
import ContinueButton from '@components/ui/ContinueButton';
import useReceivedInput from './useReceivedInput';

export default function useContinueButton(
  hasDelay: boolean = false
): [boolean, React.ReactNode] {
  const hasReceivedInput = useReceivedInput(undefined, hasDelay);
  const [hasPressedButton, setHasPressedButton] = useState(false);
  const button = <ContinueButton onClick={() => setHasPressedButton(true)} />;
  return [hasReceivedInput || hasPressedButton, button];
}
