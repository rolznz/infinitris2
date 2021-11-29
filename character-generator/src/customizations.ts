// const TierNames = [
//   'Free',
//   'Common',
//   'Classic',
//   'Premium',
//   'Rare'
// ];

type Customization = {
  tier: number;
  randomX?: number;
  randomY?: number;
  pushY?: number;
  x?: number;
  y?: number;
  hasMouth?: boolean;
};

const customizations: { [filename: string]: Customization } = {
  'cheeks_11.svg': { tier: 1 },
  'cheeks_16.svg': { tier: 2 },
  'cheeks_22.svg': { tier: 3 },
  'cheeks_3.svg': { tier: 0 },
  'cheeks_8.svg': { tier: 0 },
  'cheeks_9.svg': { tier: 0 },
  'ears_16.svg': { tier: 2 },
  'ears_17.svg': { tier: 2 },
  'ears_18.svg': { tier: 1 },
  'ears_20.svg': { tier: 0 },
  'ears_5.svg': { tier: 2 },
  'eyes_0.svg': { tier: 0 },
  'eyes_1.svg': { tier: 2 },
  'eyes_10.svg': { tier: 4 },
  'eyes_11.svg': { tier: 2 },
  'eyes_12.svg': { tier: 0 },
  'eyes_13.svg': { tier: 4, pushY: -0.1 },
  'eyes_14.svg': { tier: 2 },
  'eyes_15.svg': { tier: 4, y: -0.25 },
  'eyes_16.svg': { tier: 1 },
  'eyes_17.svg': { tier: 3 },
  'eyes_18.svg': { tier: 1, pushY: -0.1 },
  'eyes_19.svg': { tier: 4, y: -0.1 },
  'eyes_2.svg': { tier: 2 },
  'eyes_20.svg': { tier: 2 },
  'eyes_21.svg': { tier: 1 },
  'eyes_22.svg': { tier: 4 },
  'eyes_23.svg': { tier: 2, pushY: -0.1 },
  'eyes_24.svg': { tier: 2, pushY: -0.1 },
  'eyes_3.svg': { tier: 1 },
  'eyes_4.svg': { tier: 3 },
  'eyes_5.svg': { tier: 2, y: -0.06, pushY: -0.1 },
  'eyes_6.svg': { tier: 1 },
  'eyes_7.svg': { tier: 2 },
  'eyes_8.svg': { tier: 3, hasMouth: false },
  'eyes_9.svg': { tier: 3 },
  'headgear_10.svg': { tier: 1 },
  'headgear_12.svg': { tier: 2, randomX: 0, randomY: 0 },
  'headgear_16.svg': { tier: 2 },
  'headgear_18.svg': { tier: 4 },
  'headgear_19.svg': { tier: 4 },
  'headgear_2.svg': { tier: 3 },
  'headgear_20.svg': { tier: 3, randomX: 0, randomY: 0, pushY: -0.1 },
  'headgear_21.svg': { tier: 2, y: 0.03, randomX: 0 },
  'headgear_22.svg': { tier: 3 },
  'headgear_23.svg': {
    tier: 4,
    randomX: 0,
    randomY: 0,
    x: -0.05,
    y: -0.12,
    pushY: -0.2,
  },
  'headgear_24.svg': { tier: 1 },
  'headgear_3.svg': { tier: 1, randomX: 0, pushY: -0.1 },
  'headgear_5.svg': { tier: 2 },
  'mouth_0.svg': { tier: 0 },
  'mouth_1.svg': { tier: 1 },
  'mouth_10.svg': { tier: 2 },
  'mouth_11.svg': { tier: 2 },
  'mouth_12.svg': { tier: 2 },
  'mouth_13.svg': { tier: 2 },
  'mouth_14.svg': { tier: 3 },
  'mouth_15.svg': { tier: 3 },
  'mouth_16.svg': { tier: 1 },
  'mouth_17.svg': { tier: 1 },
  'mouth_18.svg': { tier: 2 },
  'mouth_19.svg': { tier: 1 },
  'mouth_2.svg': { tier: 1 },
  'mouth_20.svg': { tier: 1 },
  'mouth_21.svg': { tier: 3 },
  'mouth_22.svg': { tier: 4 },
  'mouth_23.svg': { tier: 2 },
  'mouth_24.svg': { tier: 3 },
  'mouth_3.svg': { tier: 1 },
  'mouth_4.svg': { tier: 3 },
  'mouth_5.svg': { tier: 1 },
  'mouth_6.svg': { tier: 2 },
  'mouth_7.svg': { tier: 1 },
  'mouth_9.svg': { tier: 4 },
  'pattern_0.svg': { tier: 0 },
  'pattern_1.svg': { tier: 4 },
  'pattern_10.svg': { tier: 4 },
  'pattern_11.svg': { tier: 3 },
  'pattern_12.svg': { tier: 2 },
  'pattern_13.svg': { tier: 4 },
  'pattern_14.svg': { tier: 1 },
  'pattern_15.svg': { tier: 1 },
  'pattern_16.svg': { tier: 2 },
  'pattern_17.svg': { tier: 4 },
  'pattern_18.svg': { tier: 4 },
  'pattern_19.svg': { tier: 5 },
  'pattern_2.svg': { tier: 3 },
  'pattern_20.svg': { tier: 3 },
  'pattern_21.svg': { tier: 2 },
  'pattern_22.svg': { tier: 4 },
  'pattern_23.svg': { tier: 2 },
  'pattern_24.svg': { tier: 3 },
  'pattern_3.svg': { tier: 2 },
  'pattern_4.svg': { tier: 1 },
  'pattern_5.svg': { tier: 2 },
  'pattern_6.svg': { tier: 1 },
  'pattern_7.svg': { tier: 1 },
  'pattern_8.svg': { tier: 1 },
  'pattern_9.svg': { tier: 3 },
};

export function getRandomX(filename: string): number | undefined {
  return customizations[filename]?.randomX;
}
export function getRandomY(filename: string): number | undefined {
  return customizations[filename]?.randomY;
}
export function getOffsetX(filename: string): number | undefined {
  return customizations[filename]?.x;
}
export function getOffsetY(filename: string): number | undefined {
  return customizations[filename]?.y;
}
export function getPushY(filename: string): number | undefined {
  return customizations[filename]?.pushY;
}
export function hasMouth(filename: string): boolean {
  return customizations[filename]?.hasMouth ?? true;
}

export function getPrice(filename: string): number {
  const tier = customizations[filename]?.tier;
  if (tier === undefined) {
    throw new Error('No tier set for ' + filename);
  }
  return getPriceFromTier(tier);
}
export function getPriceFromTier(tier: number): number {
  return Math.pow(tier, 3) * 2;
}
