export const GameModeTypeValues = ['infinity', 'race', 'conquest'] as const;
export type GameModeType = typeof GameModeTypeValues[number];
