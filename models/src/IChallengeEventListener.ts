import { IIngameChallengeAttempt } from '@models/IChallengeAttempt';
import ISimulation from '@models/ISimulation';

export interface IChallengeEventListener {
  onAttempt(attempt: IIngameChallengeAttempt): void;
  onChallengeReady(simulation: ISimulation): void;
}
