import { useEffect } from 'react';

export default function useTrue(variable: boolean, effect: () => void) {
  useEffect(() => {
    if (variable) {
      effect();
    }
  }, [variable, effect]);
  return null;
}
