import { InputMethod } from 'infinitris2-models';
import { defaultLocale } from '../internationalization';

const userKey = 'infinitris2-user';

export default interface User {
  readonly hasSeenWelcome: boolean;
  readonly nickname: string;
  readonly locale: string;
  readonly preferredInputMethod?: InputMethod;
  readonly completedTutorialIds: string[];
}

export function loadUser(): User {
  const user: User = JSON.parse(
    localStorage.getItem(userKey) || JSON.stringify({})
  );
  return {
    ...user,
    nickname: user.nickname || '',
    locale: user.locale || defaultLocale,
    completedTutorialIds: user.completedTutorialIds || [],
  };
}

export function saveUser(user: User): void {
  localStorage.setItem(userKey, JSON.stringify(user));
}
