import { InputActionWithData } from '@models/InputAction';
import IUser from '@models/IUser';
import { PartialBy } from '@models/typescriptHelpers';
import ChallengeCompletionStats from './ChallengeCompletionStats';
import IEntity, { IEntityReadOnlyProperties } from './IEntity';

export type ChallengeStatusCode = 'pending' | 'success' | 'failed';

export interface IChallengeAttemptReadOnlyProperties
  extends IEntityReadOnlyProperties {
  user?: Pick<IUser['readOnly'], 'nickname'> &
    Pick<IUser, 'selectedCharacterId'>;
}

export type ChallengeAttemptFrame = {
  actions: InputActionWithData[] | undefined;
};

export type ChallengeAttemptRecording = {
  frames: ChallengeAttemptFrame[];
  simulationRootSeed: number;
  // version: ChallengeAttemptRecordingVersion;
};

export interface IChallengeAttempt extends IEntity {
  readonly readOnly?: IChallengeAttemptReadOnlyProperties;
  status: ChallengeStatusCode;
  medalIndex: number; // 1 = bronze, 2 = silver, 3 = gold
  stats: ChallengeCompletionStats;
  challengeId: string;
  recording: ChallengeAttemptRecording;
  clientVersion: string;
}

export type IIngameChallengeAttempt = PartialBy<
  Omit<
    IChallengeAttempt,
    'challengeId' | 'created' | 'clientVersion' | 'userId'
  >,
  'stats'
>;
