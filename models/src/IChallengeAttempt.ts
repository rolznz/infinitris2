import ChallengeCompletionStats from './ChallengeCompletionStats';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export type ChallengeStatusCode = 'pending' | 'success' | 'failed';

export interface IChallengeAttemptReadOnlyProperties
  extends IEntityReadOnlyProperties {
  userId: string;
}

export interface IChallengeAttempt extends IEntity {
  readonly readOnly?: IChallengeAttemptReadOnlyProperties;
  status: ChallengeStatusCode;
  medalIndex: number; // 1 = bronze, 2 = silver, 3 = gold
  stats?: ChallengeCompletionStats;
  challengeId: string;
}
