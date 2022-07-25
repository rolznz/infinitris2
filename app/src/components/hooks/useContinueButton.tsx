import React from 'react';
import { useState } from 'react';
import ContinueButton from '@components/ui/ContinueButton';
import useReceivedInput from './useReceivedInput';

export default function useContinueButton(
  hotkey = 'Enter',
  message?: React.ReactNode,
  hasDelay: boolean = false,
  color: 'primary' | 'secondary' = 'primary',
  size?: 'large' | undefined,
  fontSize?: string | undefined
): [boolean, React.ReactNode] {
  const hasReceivedInput = useReceivedInput(hotkey, hasDelay);
  const [hasPressedButton, setHasPressedButton] = useState(false);
  const button = (
    <ContinueButton
      hotkey={hotkey}
      message={message}
      onClick={() => setHasPressedButton(true)}
      color={color}
      size={size}
      fontSize={fontSize}
    />
  );
  return [hasReceivedInput || hasPressedButton, button];
}
