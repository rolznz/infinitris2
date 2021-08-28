import { useUser } from '@/state/UserStore';
import { useEffect } from 'react';
import { Howl } from 'howler';
import useLoaderStore from '@/state/LoaderStore';

const rootUrl = process.env.REACT_APP_MUSIC_ROOT_URL;

let _menuTheme: Howl;
let _sounds: Howl;

export enum SoundKey {
  silence = 'silence',
  click = 'click',
  death = 'death',
  move = 'move',
  notification = 'notification',
  place = 'place',
  rotate = 'rotate',
  rotate2 = 'rotate2',
}

export async function prepareSounds() {
  // TODO: need to support loading music based on current page
  // move sfx out to separate file or rename this one
  _menuTheme = new Howl({
    src: [`${rootUrl}/menu.mp3`],
    html5: true,
    loop: true,
  });

  useLoaderStore.getState().increaseSteps();
  _menuTheme.once('play', () => {
    setTimeout(() => {
      useLoaderStore.getState().increaseStepsCompleted();
    }, 500);
  });
  await _menuTheme.load();
  _menuTheme.volume(0.5);
  _menuTheme.play();

  _sounds = new Howl({
    src: [`${rootUrl}/sounds.mp3`],
    //pool: 100,
    html5: true,
    // generated using the following command:
    // audiosprite --silence 1 *.wav --export mp3 --output sounds
    sprite: {
      [SoundKey.silence]: [0, 500],
      [SoundKey.click]: [3000, 500],
      [SoundKey.death]: [6000, 500],
      [SoundKey.move]: [9000, 500],
      [SoundKey.notification]: [12000, 500],
      [SoundKey.place]: [16000, 500],
      [SoundKey.rotate]: [19000, 500],
      [SoundKey.rotate2]: [22000, 500],
    },
  });
  _sounds.on('end', (soundId) => {
    _sounds.stop(soundId);
  });
  useLoaderStore.getState().increaseSteps();
  await _sounds.load();
  _sounds.once('play', () => {
    useLoaderStore.getState().increaseStepsCompleted();
  });
  // prepare sound sprite
  _sounds.play(SoundKey.silence);
}

export function playSound(key: SoundKey) {
  _sounds?.play(key);
}

export default function MusicPlayer() {
  const user = useUser();

  //const [currentSongId, setCurrentSongId] = React.useState(0);
  const musicOn = (user.musicOn === undefined || user.musicOn) && !!rootUrl;

  useEffect(() => {
    if (musicOn) {
      _menuTheme?.play();
    } else {
      _menuTheme?.stop();
    }
  }, [musicOn]);

  return null;
}
