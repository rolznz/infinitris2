import { RendererQuality } from '@models/RendererQuality';
import { WorldType } from '@models/WorldType';

export type WorldBackgroundLayerConfig = {
  filename: string;
  speedY: number;
  speedX: number;
  offsetX?: number;
  offsetY: number;
  minQuality?: RendererQuality; // optional layers that will only show when the quality is high enough. Unset = required on all layers
};

export type WorldBackgroundConfig = {
  layers: WorldBackgroundLayerConfig[];
  worldType: WorldType;
  floorColor: number;
};

export const worldBackgroundConfigs: WorldBackgroundConfig[] = [
  {
    worldType: 'grass',
    floorColor: 0x2066a7,
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
        offsetY: 0.1,
        minQuality: 'high',
      },
      {
        filename: 'theme_grass_4.png',
        speedY: 0.3,
        speedX: 0.3,
        offsetY: 0.3,
        minQuality: 'medium',
      },
      {
        filename: 'theme_grass_5.png',
        speedY: 0.35,
        speedX: 0.35,
        offsetY: 0.45,
        minQuality: 'medium',
      },
      {
        filename: 'theme_grass_6.png',
        speedY: 0.4,
        speedX: 0.4,
        offsetY: 0.55,
        offsetX: 0.5,
      },
      {
        filename: 'theme_grass_7.png',
        speedY: 0.45,
        speedX: 0.45,
        offsetY: 0.7,
        minQuality: 'high',
      },
    ],
  },
  {
    worldType: 'space',
    floorColor: 0x5c6294,
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
  {
    worldType: 'desert',
    floorColor: 0xffce8e,
    layers: [
      {
        filename: 'theme_desert_0.png',
        speedY: 0.1,
        speedX: 0,
        offsetY: 0,
      },
      {
        filename: 'theme_desert_2.png',
        speedY: 0.1,
        speedX: 0.1,
        offsetY: -0.25,
        offsetX: -0.025,
        minQuality: 'high',
      },
      {
        filename: 'theme_desert_1.png',
        speedY: 0.15,
        speedX: 0.15,
        offsetY: 0,
      },

      {
        filename: 'theme_desert_3.png',
        speedY: 0.25,
        speedX: 0.25,
        offsetY: 0.4,
        minQuality: 'high',
      },
      {
        filename: 'theme_desert_4.png',
        speedY: 0.3,
        speedX: 0.3,
        offsetY: 0.25,
        minQuality: 'medium',
      },
      {
        filename: 'theme_desert_5.png',
        speedY: 0.35,
        speedX: 0.35,
        offsetY: 0.5,
        minQuality: 'medium',
      },
      /*{
        filename: 'theme_desert_6.png',
        speedY: 0.4,
        speedX: 0.7,
        offsetY: 0.55,
      },*/
      {
        filename: 'theme_desert_7.png',
        speedY: 0.45,
        speedX: 0.45,
        offsetY: 0.2,
        offsetX: 0.3,
        minQuality: 'high',
      },
      {
        filename: 'theme_desert_8.png',
        speedY: 0.5,
        speedX: 0.5,
        offsetY: 0.75,
        minQuality: 'high',
      },
      /*{
        filename: 'theme_desert_9.png',
        speedY: 0.55,
        speedX: 0.55,
        offsetY: 0.7,
        minQuality: 'high',
      },*/
    ],
  },
];
