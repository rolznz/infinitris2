export const WorldTypeValues = ['grass', 'space'] as const;
export type WorldType = typeof WorldTypeValues[number];
