const userKey = 'user';

export default interface User {
  readonly nickname: string;
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
