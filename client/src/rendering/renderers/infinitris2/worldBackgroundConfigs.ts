import { RendererQuality } from '@models/RendererQuality';
import { WorldType } from '@models/WorldType';

export type WorldBackgroundLayerConfig = {
  filename: string;
  speedY: number;
  speedX: number;
  offsetY: number;
  minQuality?: RendererQuality; // optional layers that will only show when the quality is high enough. Unset = required on all layers
};

export type WorldBackgroundConfig = {
  layers: WorldBackgroundLayerConfig[];
  worldType: WorldType;
};

export const worldBackgroundConfigs: WorldBackgroundConfig[] = [
  {
    worldType: 'grass',
    layers: [
      {
        filename: 'theme_grass_0.png',
        speedY: 0.1,
        speedX: 0,
        offsetY: 0,
      },
      {
        filename: 'theme_grass_1.png',
        speedY: 0.15,
        speedX: 0.15,
        offsetY: 0,
      },
      {
        filename: 'theme_grass_2.png',
        speedY: 0.2,
        speedX: 0.2,
        offsetY: 0,
        minQuality: 'high',
      },
      {
        filename: 'theme_grass_3.png',
        speedY: 0.25,
        speedX: 0.25,
        offsetY: 0.3,
        minQuality: 'high',
      },
      {
        filename: 'theme_grass_4.png',
        speedY: 0.3,
        speedX: 0.3,
        offsetY: 0.5,
        minQuality: 'medium',
      },
      {
        filename: 'theme_grass_5.png',
        speedY: 0.35,
        speedX: 0.35,
        offsetY: 0.8,
        minQuality: 'medium',
      },
      {
        filename: 'theme_grass_6.png',
        speedY: 0.4,
        speedX: 0.4,
        offsetY: 0.9,
      },
      {
        filename: 'theme_grass_7.png',
        speedY: 0.45,
        speedX: 0.45,
        offsetY: 1.0,
        minQuality: 'high',
      },
      {
        filename: 'theme_grass_8.png',
        speedY: 0.5,
        speedX: 0.5,
        offsetY: 1.0,
      },
      {
        filename: 'theme_grass_9.png',
        speedY: 0.55,
        speedX: 0.55,
        offsetY: 1.2,
        minQuality: 'medium',
      },
      {
        filename: 'theme_grass_10.png',
        speedY: 0.6,
        speedX: 0.6,
        offsetY: 1.4,
      },
      {
        filename: 'theme_grass_11.png',
        speedY: 0.65,
        speedX: 0.65,
        offsetY: 1.6,
        minQuality: 'high',
      },
    ],
  },
  {
    worldType: 'space',
    layers: [
      {
        filename: 'theme_space_1.png',
        speedY: 0.15,
        speedX: 0.15,
        offsetY: 0,
      },
      {
        filename: 'theme_space_0.png',
        speedY: 0.1,
        speedX: 0,
        offsetY: 0,
      },
      {
        filename: 'theme_space_4.png',
        speedY: 0.2,
        speedX: 0.2,
        offsetY: 0,
      },
      {
        filename: 'theme_space_9.png',
        speedY: 0.25,
        speedX: 0.25,
        offsetY: 0.1,
      },
      {
        filename: 'theme_space_10.png',
        speedY: 0.3,
        speedX: 0.3,
        offsetY: 0.2,
      },
      {
        filename: 'theme_space_11.png',
        speedY: 0.35,
        speedX: 0.35,
        offsetY: 0.5,
      },
      {
        filename: 'theme_space_12.png',
        speedY: 0.4,
        speedX: 0.4,
        offsetY: 0.1,
      },
    ],
  },
];
