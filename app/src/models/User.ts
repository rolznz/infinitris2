import { InputMethod } from 'infinitris2-models';

const userKey = 'user';

export default interface User {
  readonly hasSeenWelcome: boolean;
  readonly nickname: string;
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
    completedTutorialIds: user.completedTutorialIds || [],
  };
}

export function saveUser(user: User): void {
  localStorage.setItem(userKey, JSON.stringify(user));
}
