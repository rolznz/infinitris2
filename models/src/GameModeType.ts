export const GameModeTypeValues = [
  'infinity',
  'race',
  'conquest',
  'conquest-infinity',
  'battle',
  'column-conquest',
] as const;
export type GameModeType = typeof GameModeTypeValues[number];
