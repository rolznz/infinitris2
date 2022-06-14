import React from 'react';
import useAppStore from '@/state/AppStore';
import { playMenuTheme } from '@/sound/SoundManager';
import useIngameStore from '@/state/IngameStore';

export function useReleaseClientOnExitPage(stopMusic = true) {
  React.useEffect(() => {
    return () => {
      useAppStore.getState().clientApi?.releaseClient();
      useIngameStore.getState().setSimulation(undefined);
      if (stopMusic) {
        playMenuTheme();
      }
    };
  }, [stopMusic]);
}
