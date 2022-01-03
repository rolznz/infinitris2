import { Howl } from 'howler';
import useLoaderStore from '@/state/LoaderStore';
import { useUserStore } from '@/state/UserStore';

const rootUrl = process.env.REACT_APP_MUSIC_ROOT_URL;
const musicFadeTimeMs = 2000;

let _menuTheme: Howl;
let _gameTheme: Howl;
let _sounds: Howl;
let _sfxOn: boolean = false;

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

export function musicLoaded(): boolean {
  return !!_menuTheme;
}
export function soundsLoaded(): boolean {
  return !!_sounds;
}

export function playGameMusic() {
  fadeOutMusic(_menuTheme);

  _gameTheme = playMusic(_gameTheme, `${rootUrl}/grass_1.mp3`, true);
}

export async function playMenuTheme() {
  fadeOutMusic(_gameTheme);

  // TODO: load based on route - requires a second howl instance to do fade
  // / = menu.mp3
  // /market = market.mp3
  _menuTheme = playMusic(_menuTheme, `${rootUrl}/menu.mp3`, false);
}

export async function prepareSoundEffects() {
  // TODO: have a specific sprite for menu sounds
  if (!_sounds) {
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
}

export function playSound(key: SoundKey) {
  if (_sfxOn) {
    _sounds?.play(key);
  }
}

export function setSfxOn(sfxOn: boolean) {
  _sfxOn = sfxOn;
}

export function setMusicPlaying(playing: boolean) {
  if (playing) {
    playMenuTheme();
  } else {
    _menuTheme?.stop();
    _gameTheme?.stop();
  }
}

function fadeOutMusic(howl: Howl) {
  if (!howl) {
    return;
  }
  howl.fade(0.5, 0, musicFadeTimeMs);
  setTimeout(() => {
    howl.loop(false); // stop repeat - safari/ios issue
    howl.stop(); // stop the song - fade does not work on safari/ios
  }, musicFadeTimeMs);
}
function playMusic(existingHowl: Howl, url: string, fadeIn: boolean): Howl {
  if (existingHowl) {
    existingHowl.unload();
  }
  existingHowl = new Howl({
    src: [url],
    html5: true,
    loop: true,
  });

  useLoaderStore.getState().increaseSteps();
  existingHowl.once('play', () => {
    setTimeout(() => {
      useLoaderStore.getState().increaseStepsCompleted();
    }, 500);
  });
  existingHowl.load();
  if (fadeIn) {
    existingHowl.volume(0);
  } else {
    existingHowl.volume(0.5);
  }
  existingHowl.loop(true);
  existingHowl.seek(0);
  existingHowl.play();
  if (fadeIn) {
    existingHowl.fade(0, 1, musicFadeTimeMs);
  }
  return existingHowl;
}
