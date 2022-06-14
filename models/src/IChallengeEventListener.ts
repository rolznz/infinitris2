import { IIngameChallengeAttempt } from '@models/IChallengeAttempt';

export interface IChallengeEventListener {
  onAttempt(attempt: IIngameChallengeAttempt): void;
}
