export const WorldTypeValues = ['grass', 'desert', 'volcano'] as const;
export type WorldType = typeof WorldTypeValues[number];

export const WorldVariationValues = ['0', '1', '2', '3', '4', '5'] as const;
export type WorldVariation = typeof WorldVariationValues[number];
