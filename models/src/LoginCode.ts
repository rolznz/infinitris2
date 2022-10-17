import Timestamp from './Timestamp';

export type LoginCode = {
  code: string;
  createdDateTime: Timestamp;
  numAttempts: number;
  allowUserCreation?: boolean;
};
