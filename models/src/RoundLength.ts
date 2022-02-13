export const RoundLengthValues = ['short', 'medium', 'long'] as const;
export type RoundLength = typeof RoundLengthValues[number];
