import {
  ControlSettings,
  DEFAULT_KEYBOARD_CONTROLS,
  InputMethod,
  TutorialStatus,
} from 'infinitris2-models';
import { defaultLocale } from '../internationalization';

const userKey = 'infinitris2-user-v3';

export default interface User {
  readonly tutorialAttempts: { [tutorialId: string]: TutorialStatus[] };
  readonly hasSeenWelcome: boolean;
  readonly nickname: string;
  readonly locale: string;
  readonly preferredInputMethod?: InputMethod;
  readonly completedTutorialIds: string[];
  readonly controls: ControlSettings;
}

export function loadUser(): User {
  const user: User = JSON.parse(
    localStorage.getItem(userKey) || JSON.stringify({})
  );
  return {
    ...user,
    nickname: user.nickname || '',
    tutorialAttempts: user.tutorialAttempts || {},
    locale: user.locale || defaultLocale,
    completedTutorialIds: user.completedTutorialIds || [],
    controls: user.controls || DEFAULT_KEYBOARD_CONTROLS,
  };
}

export function saveUser(user: User): void {
  localStorage.setItem(userKey, JSON.stringify(user));
}
