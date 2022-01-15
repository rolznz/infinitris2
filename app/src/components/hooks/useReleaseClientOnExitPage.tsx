import React from 'react';
import useLocalUserStore from '@/state/LocalUserStore';
import useAppStore from '@/state/AppStore';
import { playMenuTheme } from '@/components/sound/MusicPlayer';

export function useReleaseClientOnExitPage() {
  React.useEffect(() => {
    return () => {
      useAppStore.getState().clientApi?.releaseClient();
      // FIXME: need a better way to access isMusicOn - store in music player
      if (useLocalUserStore.getState().user.musicOn) {
        playMenuTheme();
      }
    };
  }, []);
}
