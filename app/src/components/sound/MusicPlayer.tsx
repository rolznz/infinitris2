import { storage } from '@/firebase';
import { useUser } from '@/state/UserStore';
import React, { useEffect, useState } from 'react';
import ReactHowler from 'react-howler';
import Loadable from '../ui/Loadable';

export default function MusicPlayer() {
  const user = useUser();
  const rootUrl = process.env.REACT_APP_MUSIC_ROOT_URL;
  const musicOn = (user.musicOn === undefined || user.musicOn) && !!rootUrl;
  return (
    <>
      {musicOn && (
        <Loadable
          child={(onLoad) => (
            <>
              {
                <ReactHowler
                  src={`${rootUrl}/menu.mp3`}
                  playing
                  loop
                  onLoad={onLoad}
                />
              }
            </>
          )}
        />
      )}
    </>
  );
}
