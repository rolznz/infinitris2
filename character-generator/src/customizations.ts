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
  useHeadgearOffset?: boolean;
};

const customizations: { [filename: string]: Customization } = {
  'ears_16.svg': { tier: 4 },
  'ears_17.svg': { tier: 5, rarity: 1 },
  'ears_18.svg': { tier: 1 },
  'ears_20.svg': { tier: 1 },
  'ears_25.svg': { tier: 0 },
  'ears_5.svg': { tier: 2 },
  'eyes_0.svg': { tier: 0 },
  'eyes_1.svg': { tier: 2, y: -0.05, pushY: 0.02 },
  'eyes_10.svg': { tier: 4, y: -0.05, pushY: 0.05 },
  'eyes_11.svg': { tier: 1, pushY: 0.02 },
  'eyes_12.svg': { tier: 0 },
  'eyes_13.svg': { tier: 5 },
  'eyes_14.svg': { tier: 3 },
  'eyes_15.svg': {
    tier: 3,
    y: -0.275,
    randomY: 0,
    randomX: 0.1,
    hasHeadgear: false,
  },
  'eyes_16.svg': { tier: 5, rarity: 1 },
  'eyes_17.svg': { tier: 4 },
  'eyes_18.svg': { tier: 2 },
  'eyes_19.svg': { tier: 4 },
  'eyes_2.svg': { tier: 1, pushY: 0.02 },
  'eyes_20.svg': { tier: 1 },
  'eyes_21.svg': { tier: 2 },
  'eyes_22.svg': { tier: 5 },
  'eyes_23.svg': { tier: 3 },
  'eyes_24.svg': { tier: 3, rarity: 1, pushY: 0, y: -0.05 },
  'eyes_3.svg': { tier: 0 },
  'eyes_4.svg': { tier: 4 },
  'eyes_5.svg': { tier: 1, rarity: 1, y: -0.06, pushY: -0.1 },
  'eyes_6.svg': {
    tier: 1,
    rarity: 1,
    y: -0.05,
    randomX: 0,
    randomY: 0,
    useHeadgearOffset: false,
  },
  'eyes_7.svg': { tier: 3 },
  'eyes_8.svg': { tier: 1, hasMouth: false },
  'eyes_9.svg': { tier: 1, pushY: 0.06 },
  'eyes_25.svg': { tier: 3, rarity: 1 },
  'eyes_27.svg': { tier: 3, rarity: 1 },
  'eyes_28.svg': { tier: 0 },
  'eyes_29.svg': { tier: 0, pushY: 0.02 },
  'eyes_30.svg': { tier: 0 },
  'eyes_31.svg': { tier: 0 },
  'eyes_32.svg': { tier: 3, pushY: 0.02 },
  'headgear_10.svg': {
    tier: 2,
    rarity: 1,
    pushY: 0.05,
    randomX: 0,
    randomY: 0,
    y: -0.075,
  },
  'headgear_12.svg': { tier: 2, rarity: 1, randomX: 0, randomY: 0, y: 0.11 },
  'headgear_16.svg': { tier: 5, randomX: 0.1, randomY: 0, y: -0.07 },
  'headgear_18.svg': {
    tier: 4,
    randomX: 0,
    randomY: 0.1,
    y: 0.15,
    pushY: -0.025,
  },
  'headgear_19.svg': {
    tier: 3,
    rarity: 1,
    randomX: 0.0,
    randomY: 0.1,
    y: -0.08,
  },
  'headgear_2.svg': { tier: 2, pushY: -0.05 },
  'headgear_20.svg': {
    tier: 4,
    rarity: 1,
    randomX: 0,
    randomY: 0,
    y: 0.0,
    pushY: -0.035,
  },
  'headgear_21.svg': { tier: 1, y: 0.07, randomX: 0, randomY: 0 },
  'headgear_22.svg': { tier: 2 },
  'headgear_23.svg': {
    tier: 5,
    rarity: 1,
    randomX: 0,
    randomY: 0,
    y: -0.035,
    pushY: -0.15,
  },
  'headgear_24.svg': {
    tier: 5,
    y: -0.06,
    randomX: 0.1,
    randomY: 0,
    pushY: 0.04,
  },
  'headgear_3.svg': {
    tier: 0,
    randomX: 0,
    pushY: -0.05,
    randomY: 0.2,
    y: 0.1,
    rarity: 1,
  },
  'headgear_5.svg': { tier: 4, randomX: 0.1, randomY: 0, y: -0.07 },
  'headgear_25.svg': {
    tier: 4,
    randomX: 0,
    rarity: 1,
    pushY: 0.02,
  },
  'headgear_26.svg': { tier: 3, randomX: 0, randomY: 0, rarity: 1, y: 0.03 },
  'headgear_27.svg': { tier: 4, randomX: 0, rarity: 1, randomY: 0, y: -0.07 },
  'headgear_28.svg': { tier: 4, randomX: 0, rarity: 1, randomY: 0, y: -0.01 },
  'mouth_0.svg': { tier: 0 },
  'mouth_1.svg': { tier: 2 },
  'mouth_10.svg': { tier: 2 },
  'mouth_11.svg': { tier: 1 },
  'mouth_12.svg': { tier: 0 },
  'mouth_13.svg': { tier: 3 },
  'mouth_14.svg': { tier: 3 },
  'mouth_15.svg': { tier: 3, y: 0.02 },
  'mouth_16.svg': { tier: 1 },
  'mouth_17.svg': { tier: 0 },
  'mouth_18.svg': { tier: 1 },
  'mouth_19.svg': { tier: 0 },
  'mouth_2.svg': { tier: 2 },
  'mouth_20.svg': { tier: 3 },
  'mouth_21.svg': { tier: 3, randomX: 0.03 },
  'mouth_22.svg': { tier: 3, y: 0.025 },
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
export function useHeadgearOffset(filename: string): boolean {
  return customizations[filename]?.useHeadgearOffset ?? true;
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
