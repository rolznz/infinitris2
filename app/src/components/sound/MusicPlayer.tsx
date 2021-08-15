import { storage } from '@/firebase';
import { useUser } from '@/state/UserStore';
import React, { useEffect, useState } from 'react';
import ReactHowler from 'react-howler';

export default function MusicPlayer() {
  const user = useUser();
  const musicOn = user.musicOn === undefined || user.musicOn;
  const [menuUrl, setMenuUrl] = useState<string>();

  useEffect(() => {
    if (musicOn) {
      storage
        .ref(`/music/menu.mp3`)
        .getDownloadURL()
        .then((url) => {
          setMenuUrl(url);
        });
    }
  }, [musicOn]);

  return (
    <>
      {musicOn && menuUrl && <ReactHowler src={menuUrl} playing loop html5 />}
    </>
  );
}
