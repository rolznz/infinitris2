export const GameModeTypeValues = [
  'infinity',
  'race',
  'conquest',
  'garbage-defense',
  'column-conquest',
  'battle',
] as const;
export type GameModeType = typeof GameModeTypeValues[number];
