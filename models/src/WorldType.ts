export const WorldTypeValues = ['grass', 'space', 'desert'] as const;
export type WorldType = typeof WorldTypeValues[number];
