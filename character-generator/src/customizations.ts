// const TierNames = [
//   'Free',
//   'Common',
//   'Classic',
//   'Premium',
//   'Rare'
// ];

type Customization = {
  tier: number;
  rarity?: number;
  randomX?: number;
  randomY?: number;
  pushY?: number;
  x?: number;
  y?: number;
  hasMouth?: boolean;
  hasHeadgear?: boolean;
};

const customizations: { [filename: string]: Customization } = {
  'ears_16.svg': { tier: 4 },
  'ears_17.svg': { tier: 5, rarity: 1 },
  'ears_18.svg': { tier: 1 },
  'ears_20.svg': { tier: 1 },
  'ears_25.svg': { tier: 0 },
  'ears_5.svg': { tier: 2 },
  'eyes_0.svg': { tier: 0 },
  'eyes_1.svg': { tier: 2, pushY: -0.05 },
  'eyes_10.svg': { tier: 4 },
  'eyes_11.svg': { tier: 1, pushY: -0.05 },
  'eyes_12.svg': { tier: 0 },
  'eyes_13.svg': { tier: 5, pushY: -0.05 },
  'eyes_14.svg': { tier: 3 },
  'eyes_15.svg': {
    tier: 3,
    y: -0.25,
    randomY: 0,
    randomX: 0.1,
    hasHeadgear: false,
  },
  'eyes_16.svg': { tier: 5, rarity: 1 },
  'eyes_17.svg': { tier: 4 },
  'eyes_18.svg': { tier: 2, pushY: -0.05 },
  'eyes_19.svg': { tier: 4 },
  'eyes_2.svg': { tier: 1, pushY: -0.05 },
  'eyes_20.svg': { tier: 1 },
  'eyes_21.svg': { tier: 2 },
  'eyes_22.svg': { tier: 5, pushY: -0.02 },
  'eyes_23.svg': { tier: 3 },
  'eyes_24.svg': { tier: 3, rarity: 1, pushY: -0.15, y: -0.05 },
  'eyes_3.svg': { tier: 0, pushY: -0.05 },
  'eyes_4.svg': { tier: 4 },
  'eyes_5.svg': { tier: 1, rarity: 1, y: -0.06, pushY: -0.1 },
  'eyes_6.svg': { tier: 1, rarity: 1, y: -0.07 },
  'eyes_7.svg': { tier: 3 },
  'eyes_8.svg': { tier: 1, hasMouth: false },
  'eyes_9.svg': { tier: 1 },
  'eyes_25.svg': { tier: 3, rarity: 1 },
  'eyes_27.svg': { tier: 3, rarity: 1 },
  'eyes_28.svg': { tier: 0 },
  'eyes_29.svg': { tier: 0 },
  'eyes_30.svg': { tier: 0 },
  'eyes_31.svg': { tier: 0 },
  'eyes_32.svg': { tier: 1 },
  'headgear_10.svg': {
    tier: 2,
    rarity: 1,
    pushY: -0.05,
    randomX: 0.1,
    y: -0.07,
  },
  'headgear_12.svg': { tier: 2, rarity: 1, randomX: 0, randomY: 0 },
  'headgear_16.svg': { tier: 5, randomX: 0.1, pushY: -0.05 },
  'headgear_18.svg': { tier: 4, randomX: 0, y: 0.07 },
  'headgear_19.svg': { tier: 3, rarity: 1, randomX: 0.3, pushY: -0.05 },
  'headgear_2.svg': { tier: 2, pushY: -0.1 },
  'headgear_20.svg': {
    tier: 4,
    rarity: 1,
    randomX: 0,
    randomY: 0,
    pushY: -0.1,
    y: -0.035,
  },
  'headgear_21.svg': { tier: 1, y: 0.03, randomX: 0, pushY: -0.07 },
  'headgear_22.svg': { tier: 2 },
  'headgear_23.svg': {
    tier: 5,
    rarity: 1,
    randomX: 0,
    randomY: 0,
    y: -0.035,
    pushY: -0.15,
  },
  'headgear_24.svg': { tier: 5, y: -0.1, randomY: 0.1, pushY: -0.15 },
  'headgear_3.svg': { tier: 0, randomX: 0, pushY: -0.05 },
  'headgear_5.svg': { tier: 4, randomX: 0.1 },
  'headgear_25.svg': { tier: 4, randomX: 0, rarity: 1 },
  'headgear_26.svg': { tier: 3, randomX: 0, rarity: 1 },
  'headgear_27.svg': { tier: 4, randomX: 0, rarity: 1 },
  'headgear_28.svg': { tier: 4, randomX: 0, rarity: 1 },
  'mouth_0.svg': { tier: 0 },
  'mouth_1.svg': { tier: 2 },
  'mouth_10.svg': { tier: 2 },
  'mouth_11.svg': { tier: 1 },
  'mouth_12.svg': { tier: 0 },
  'mouth_13.svg': { tier: 3 },
  'mouth_14.svg': { tier: 3 },
  'mouth_15.svg': { tier: 3 },
  'mouth_16.svg': { tier: 1 },
  'mouth_17.svg': { tier: 0 },
  'mouth_18.svg': { tier: 1 },
  'mouth_19.svg': { tier: 0, y: -0.05 },
  'mouth_2.svg': { tier: 2 },
  'mouth_20.svg': { tier: 3 },
  'mouth_21.svg': { tier: 3, randomX: 0.03 },
  'mouth_22.svg': { tier: 3 },
  'mouth_23.svg': { tier: 1 },
  'mouth_24.svg': { tier: 3, rarity: 1 },
  'mouth_25.svg': { tier: 4, rarity: 1 },
  'mouth_27.svg': { tier: 3, rarity: 1 },
  'mouth_3.svg': { tier: 1 },
  'mouth_4.svg': { tier: 2 },
  'mouth_5.svg': { tier: 0 },
  'mouth_6.svg': { tier: 3 },
  'mouth_7.svg': { tier: 1 },
  'mouth_9.svg': { tier: 0 },
  'mouth_28.svg': { tier: 0 },
  'mouth_29.svg': { tier: 0 },
  'mouth_30.svg': { tier: 1 },
  'mouth_31.svg': { tier: 0 },
  'mouth_32.svg': { tier: 0 },
  'pattern_0.svg': { tier: 0 },
  'pattern_1.svg': { tier: 5 },
  'pattern_10.svg': { tier: 5 },
  'pattern_11.svg': { tier: 3 },
  'pattern_12.svg': { tier: 1 },
  'pattern_13.svg': { tier: 4 },
  'pattern_14.svg': { tier: 1 },
  'pattern_15.svg': { tier: 3 },
  'pattern_16.svg': { tier: 1 },
  'pattern_17.svg': { tier: 3 },
  'pattern_18.svg': { tier: 2 },
  'pattern_19.svg': { tier: 2 },
  'pattern_2.svg': { tier: 4 },
  'pattern_20.svg': { tier: 2 },
  'pattern_21.svg': { tier: 4 },
  'pattern_22.svg': { tier: 4 },
  'pattern_23.svg': { tier: 1 },
  'pattern_24.svg': { tier: 2 },
  'pattern_3.svg': { tier: 3 },
  'pattern_4.svg': { tier: 3 },
  'pattern_5.svg': { tier: 1 },
  'pattern_6.svg': { tier: 1 },
  'pattern_7.svg': { tier: 1 },
  'pattern_8.svg': { tier: 3 },
  'pattern_9.svg': { tier: 2 },
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
export function hasHeadgear(filename: string): boolean {
  return customizations[filename]?.hasHeadgear ?? true;
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
export function getRarity(filename: string): number {
  return customizations[filename]?.rarity || 0;
}
