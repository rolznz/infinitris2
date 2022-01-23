export const GameModeTypeValues = ['infinity', 'conquest'] as const;
export type GameModeType = typeof GameModeTypeValues[number];
