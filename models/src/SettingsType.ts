import Timestamp from '@models/Timestamp';

export type SettingsKey = 'scoreboard' | 'premium';
export type ScoreboardSettings = {
  lastUpdatedTimestamp: Timestamp;
};

export type PremiumSettings = {
  lastUpdatedTimestamp: Timestamp;
  freeAccountsRemaining: number;
};
