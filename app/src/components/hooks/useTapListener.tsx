import React, { useEffect } from 'react';
import { useTimeout } from 'react-use';

export default function useTapListener(isReadyTimeout: number = 1000): boolean {
  const [isReady] = useTimeout(isReadyTimeout);
  const [hasTapped, setHasTapped] = React.useState(false);

  useEffect(() => {
    function touchHandler() {
      if (isReady()) {
        setHasTapped(true);
      }
    }
    window.addEventListener('touchend', touchHandler);
    return () => {
      window.removeEventListener('touchend', touchHandler);
    };
  }, [isReady]);

  return hasTapped;
}
