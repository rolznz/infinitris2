export const GameModeTypeValues = [
  'infinity',
  'race',
  'conquest',
  'garbage-defense',
  'escape',
  'column-conquest',
  'battle',
] as const;
export type GameModeType = typeof GameModeTypeValues[number];
