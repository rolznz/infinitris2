import Timestamp from './Timestamp';

export type Donation = {
  readonly createdTimestamp: Timestamp;
  readonly amount: number;
  readonly comment: string;
};
