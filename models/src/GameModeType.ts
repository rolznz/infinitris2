export const GameModeTypeValues = [
  'infinity',
  'race',
  'conquest',
  'battle',
  'column-conquest',
] as const;
export type GameModeType = typeof GameModeTypeValues[number];
