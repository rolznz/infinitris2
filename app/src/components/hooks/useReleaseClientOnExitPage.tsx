import React from 'react';
import useAppStore from '@/state/AppStore';
import { playMenuTheme } from '@/components/sound/MusicPlayer';

export function useReleaseClientOnExitPage() {
  React.useEffect(() => {
    return () => {
      useAppStore.getState().clientApi?.releaseClient();
      playMenuTheme();
    };
  }, []);
}
