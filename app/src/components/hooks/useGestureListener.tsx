import React, { useEffect } from 'react';
import { useTimeout } from 'react-use';

export enum Gesture {
  Touch,
  LongPress,
}

export default function useGestureListener(
  gesture: Gesture = Gesture.Touch,
  isReadyTimeout: number = 1000,
  interactionId: number = 0
): boolean {
  const [isReady] = useTimeout(isReadyTimeout);
  const [hasTapped, setHasTapped] = React.useState(false);
  const [tapStartTime, setTapStartTime] = React.useState(0);

  useEffect(() => {
    setHasTapped(false);
  }, [interactionId]);

  useEffect(() => {
    function touchStartHandler() {
      setTapStartTime(Date.now());
    }
    function touchEndHandler() {
      const touchTime = Date.now() - tapStartTime;
      const receivedGesture =
        touchTime > 500 ? Gesture.LongPress : Gesture.Touch;
      if (isReady() && receivedGesture === gesture) {
        setHasTapped(true);
      }
    }
    window.addEventListener('touchstart', touchStartHandler);
    window.addEventListener('touchend', touchEndHandler);
    return () => {
      window.removeEventListener('touchstart', touchStartHandler);
      window.removeEventListener('touchend', touchEndHandler);
    };
  }, [isReady, gesture, tapStartTime, setTapStartTime]);

  return hasTapped;
}
