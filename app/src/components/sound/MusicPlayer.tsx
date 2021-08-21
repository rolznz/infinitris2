import { storage } from '@/firebase';
import { useUser } from '@/state/UserStore';
import sessionStorageKeys from '@/utils/sessionStorageKeys';
import React, { useEffect, useState } from 'react';
import ReactHowler from 'react-howler';
import Loadable from '../ui/Loadable';

export default function MusicPlayer() {
  const user = useUser();
  const musicOn = user.musicOn === undefined || user.musicOn;
  const [menuUrl, setMenuUrl] = useState<string>();

  useEffect(() => {
    if (musicOn) {
      (async () => {
        let menuUrl = sessionStorage.getItem(sessionStorageKeys.menuThemeUrl);
        if (!menuUrl) {
          menuUrl = await storage.ref(`/music/menu.mp3`).getDownloadURL();
          sessionStorage.setItem(sessionStorageKeys.menuThemeUrl, menuUrl!);
        }
        setMenuUrl(menuUrl!);
      })();
    }
  }, [musicOn]);

  return (
    <>
      {musicOn && (
        <Loadable
          child={(onLoad) => (
            <>
              {menuUrl && (
                <ReactHowler src={menuUrl} playing loop onLoad={onLoad} />
              )}
            </>
          )}
        />
      )}
    </>
  );
}
