// TODO: howler sucks and is buggy af, remove it and just use web audio API
// sound effects laggy and unplayable on ios, random repeats and loops.
// currently only being used for music, but even the fades don't work on ios...
import { Howl } from 'howler';
import useLoaderStore from '@/state/LoaderStore';
import {
  WorldType,
  WorldVariation,
  WorldVariationValues,
} from 'infinitris2-models';

const rootUrl = process.env.REACT_APP_MUSIC_ROOT_URL;
const musicFadeTimeMs = 2000;
const MUTE = false;

let _menuTheme: Howl | undefined;
let _gameTheme: Howl | undefined;
let _sounds: Howl;
let _sfxOn: boolean = false;
let _musicOn: boolean = false;
let _musicVolume: number = 1;
let _sfxVolume: number = 1;

type SoundPackName = '25Pi25' | 'sounds';
const selectedSoundPackName: SoundPackName = '25Pi25';

const soundPacks: Record<SoundPackName, Partial<SoundEntry>> = {
  '25Pi25': {
    click: [2000, 1900],
    move: [2000, 1900],
    rotate: [5000, 1900],
    drop: [8000, 1900],
    death: [11000, 1900],
  },
  sounds: {
    silence: [0, 500],
    click: [3000, 500],
    death: [6000, 500],
    move: [9000, 500],
    notification: [12000, 500],
    place: [16000, 500],
    rotate: [19000, 500],
    drop: [22000, 500],
    spawn: [12000, 500],
  },
};

export enum SoundKey {
  silence = 'silence',
  click = 'click',
  death = 'death',
  move = 'move',
  notification = 'notification',
  place = 'place',
  rotate = 'rotate',
  drop = 'drop',
  spawn = 'spawn',
}
type SoundEntry = Record<SoundKey, [number, number]>;

export const TrackNumberValues = ['1', '2', '3', '4', '5', 'bonus'] as const;
export type TrackNumber = typeof TrackNumberValues[number];

export function musicLoaded(): boolean {
  return !!_menuTheme;
}
export function soundsLoaded(): boolean {
  return !!_sounds;
}

export function worldVariationToTrackNumber(
  worldVariation: WorldVariation | undefined
): TrackNumber {
  return TrackNumberValues[
    WorldVariationValues.indexOf(worldVariation || WorldVariationValues[0])
  ];
}

export function playGameMusic(
  worldType: WorldType = 'grass',
  trackNumber: TrackNumber = '1'
) {
  fadeOutMusic(_menuTheme);

  // TODO: add tracks for space and desert
  _gameTheme = playMusic(
    _gameTheme,
    `${rootUrl}/${worldType}_${trackNumber}.mp3`,
    true
  );
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
    useLoaderStore.getState().addStep('sfx');
    _sfxContext = new AudioContext();

    try {
      _sfxAudioBuffer = await fetch(`${rootUrl}/${selectedSoundPackName}.mp3`)
        .then((res) => {
          return res.arrayBuffer();
        })
        .then((ArrayBuffer) => _sfxContext.decodeAudioData(ArrayBuffer));
    } catch (error) {
      alert(
        'Error: ' + JSON.stringify(error, Object.getOwnPropertyNames(error))
      );
    }
    useLoaderStore.getState().completeStep('sfx');
  }
}

prepareSoundEffects();

export function playSound(key: SoundKey) {
  if (_sfxOn) {
    const pack = soundPacks[selectedSoundPackName];
    const entry = pack[key];
    if (entry) {
      const startMs = entry[0];
      const offsetMs = entry[1];
      const source = _sfxContext.createBufferSource();
      source.buffer = _sfxAudioBuffer;
      const gainNode = _sfxContext.createGain();
      gainNode.gain.value = _sfxVolume;
      gainNode.connect(_sfxContext.destination);
      // now instead of connecting to aCtx.destination, connect to the gainNode
      source.connect(gainNode);
      //source.connect(_sfxContext.destination);
      source.start(undefined, startMs / 1000, offsetMs / 1000);
    }
  }
}

export function setSfxOn(sfxOn: boolean) {
  _sfxOn = !MUTE && sfxOn;
}

export function setMusicOn(musicOn: boolean) {
  _musicOn = !MUTE && musicOn;
}

export function setMusicVolume(musicVolume: number) {
  _menuTheme?.volume(musicVolume);
  _musicVolume = musicVolume;
}
export function setSfxVolume(sfxVolume: number) {
  _sfxVolume = sfxVolume;
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
  howl.fade(_musicVolume, 0, musicFadeTimeMs);
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

  useLoaderStore.getState().addStep('music');
  existingHowl.once('play', () => {
    setTimeout(() => {
      useLoaderStore.getState().completeStep('music');
    }, 500);
  });
  existingHowl.load();
  if (fadeIn) {
    existingHowl.volume(0);
  } else {
    existingHowl.volume(_musicVolume);
  }
  existingHowl.loop(true);
  existingHowl.seek(0);
  existingHowl.play();
  if (fadeIn) {
    existingHowl.fade(0, _musicVolume, musicFadeTimeMs);
  }
  return existingHowl;
}
