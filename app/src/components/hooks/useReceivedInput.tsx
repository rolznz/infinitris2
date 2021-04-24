import { useKeyPress, useTimeout } from 'react-use';

export default function useReceivedInput(
  key: string = 'Enter',
  hasDelay: boolean = false
): boolean {
  const [isReady] = useTimeout(hasDelay ? 1000 : undefined);

  const [keyPressed] = useKeyPress(
    (event: KeyboardEvent) => event.key === key && (!hasDelay || !!isReady())
  );

  return keyPressed;
}
