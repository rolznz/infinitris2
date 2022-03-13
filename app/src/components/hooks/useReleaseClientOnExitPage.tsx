import React from 'react';
import useAppStore from '@/state/AppStore';
import { playMenuTheme } from '@/components/sound/MusicPlayer';
import useIngameStore from '@/state/IngameStore';

export function useReleaseClientOnExitPage() {
  React.useEffect(() => {
    return () => {
      useAppStore.getState().clientApi?.releaseClient();
      useIngameStore.getState().setSimulation(undefined);
      playMenuTheme();
    };
  }, []);
}
