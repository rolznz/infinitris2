import { InputActionWithData } from '@models/InputAction';
import ChallengeCompletionStats from './ChallengeCompletionStats';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export type ChallengeStatusCode = 'pending' | 'success' | 'failed';

export interface IChallengeAttemptReadOnlyProperties
  extends IEntityReadOnlyProperties {
  userId: string;
}

export type ChallengeAttemptFrame = {
  actions: InputActionWithData[];
};

export type ChallengeAttemptRecording = {
  frames: ChallengeAttemptFrame[];
  seed: number;
  // version: ChallengeAttemptRecordingVersion;
};

export interface IChallengeAttempt extends IEntity {
  readonly readOnly?: IChallengeAttemptReadOnlyProperties;
  status: ChallengeStatusCode;
  medalIndex: number; // 1 = bronze, 2 = silver, 3 = gold
  stats?: ChallengeCompletionStats;
  challengeId: string;
  recording: ChallengeAttemptRecording;
}

export type IIngameChallengeAttempt = Omit<
  IChallengeAttempt,
  'challengeId' | 'created'
>;
