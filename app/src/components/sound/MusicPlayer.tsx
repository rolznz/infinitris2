// TODO: howler sucks and is buggy af, remove it and just use web audio API
// sound effects laggy and unplayable on ios, random repeats and loops.
// currently only being used for music, but even the fades don't work on ios...
import { Howl } from 'howler';
import useLoaderStore from '@/state/LoaderStore';

const rootUrl = process.env.REACT_APP_MUSIC_ROOT_URL;
const musicFadeTimeMs = 2000;
const MUTE = false;

let _menuTheme: Howl | undefined;
let _gameTheme: Howl | undefined;
let _sounds: Howl;
let _sfxOn: boolean = false;
let _musicOn: boolean = false;

export const SoundKey = {
  silence: [0, 500],
  click: [3000, 500],
  death: [6000, 500],
  move: [9000, 500],
  notification: [12000, 500],
  place: [16000, 500],
  rotate: [19000, 500],
  drop: [22000, 500],
  spawn: [12000, 500],
};

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

let _sfxContext: AudioContext;
let _sfxAudioBuffer: AudioBuffer;

async function prepareSoundEffects() {
  if (!_sfxContext) {
    useLoaderStore.getState().increaseSteps();
    _sfxContext = new AudioContext();

    try {
      _sfxAudioBuffer = await fetch(`${rootUrl}/sounds.mp3`)
        .then((res) => {
          return res.arrayBuffer();
        })
        .then((ArrayBuffer) => _sfxContext.decodeAudioData(ArrayBuffer));
    } catch (error) {
      alert(
        'Error: ' + JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
    }
    useLoaderStore.getState().increaseStepsCompleted();
  }
}

prepareSoundEffects();

export function playSound([startMs, offsetMs]: number[]) {
  if (_sfxOn) {
    const source = _sfxContext.createBufferSource();
    source.buffer = _sfxAudioBuffer;
    source.connect(_sfxContext.destination);
    source.start(undefined, startMs / 1000, offsetMs / 1000);
  }
}

export function setSfxOn(sfxOn: boolean) {
  _sfxOn = !MUTE && sfxOn;
}

export function setMusicOn(musicOn: boolean) {
  _musicOn = !MUTE && musicOn;
}

export function setMusicPlaying(playing: boolean) {
  if (playing) {
    playMenuTheme();
  } else {
    // TODO: stopMusic(howl);
    _menuTheme?.loop(false);
    _gameTheme?.loop(false);
    _menuTheme?.stop();
    _gameTheme?.stop();
  }
}

function fadeOutMusic(howl: Howl | undefined) {
  if (!howl) {
    return;
  }
  howl.fade(0.5, 0, musicFadeTimeMs);
  setTimeout(() => {
    howl.loop(false); // stop repeat - safari/ios issue
    howl.stop(); // stop the song - fade does not work on safari/ios
  }, musicFadeTimeMs);
}
function playMusic(
  existingHowl: Howl | undefined,
  url: string,
  fadeIn: boolean
): Howl | undefined {
  if (!_musicOn) {
    return undefined;
  }
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
