import { RendererQuality } from '@models/RendererQuality';
import { WorldType } from '@models/WorldType';

export type WorldBackgroundLayerConfig = {
  filename: string;
  speedY: number;
  speedX: number;
  offsetX?: number;
  offsetY: number;
  portraitOffsetY?: number;
  //minQuality?: RendererQuality; // optional layers that will only show when the quality is high enough. Unset = required on all layers
  scale?: number;
  repeatGap?: number; // TODO: this needs to be different on mobile
};

export type WorldBackgroundConfig = {
  layers: WorldBackgroundLayerConfig[];
  worldType: WorldType;
  floorColor: number;
  hasFloorImage?: boolean;
};

export const worldBackgroundConfigs: WorldBackgroundConfig[] = [
  {
    worldType: 'grass',
    floorColor: 0x2066a7,
    hasFloorImage: true,
    layers: [
      {
        filename: 'theme_grass_0.png',
        speedY: 0.1,
        speedX: 0,
        offsetY: 0,
      },
      {
        filename: 'theme_grass_1.png',
        speedY: 0.05,
        speedX: 0.05,
        offsetY: 0,
      },
      {
        filename: 'theme_grass_2.png',
        speedY: 0.2,
        speedX: 0.2,
        offsetX: 0.03,
        offsetY: 0.1,
        repeatGap: 15,
        scale: 0.3,
      },
      {
        filename: 'theme_grass_3.png',
        speedY: 0.25,
        speedX: 0.25,
        offsetY: 0,
        portraitOffsetY: 0.01,
      },
      {
        filename: 'theme_grass_4.png',
        speedY: 0.3,
        speedX: 0.3,
        offsetX: -0.2,
        offsetY: -0.2,
        portraitOffsetY: 0.1,
      },
      {
        filename: 'theme_grass_5.png',
        speedY: 0.4,
        speedX: 0.4,
        offsetY: 0.3,
        portraitOffsetY: 0.1,
      },
      {
        filename: 'theme_grass_6.png',
        speedY: 0.5,
        speedX: 0.5,
        offsetY: 0.05,
        offsetX: 0.1,
        portraitOffsetY: 0.2,
      },
      {
        filename: 'theme_grass_7.png',
        speedY: 0.6,
        speedX: 0.6,
        offsetY: 0,
        offsetX: 0.05,
        repeatGap: 0.5,
        scale: 1,
        portraitOffsetY: 0.13,
      },
      {
        filename: 'theme_grass_8.png',
        speedY: 0.8,
        speedX: 0.8,
        offsetY: 0.4,
        portraitOffsetY: 0.08,
      },
      {
        filename: 'theme_grass_9.png',
        speedY: 0.9,
        speedX: 0.9,
        offsetY: 0.25,
        offsetX: 0.1,
        portraitOffsetY: 0.13,
      },
      {
        filename: 'theme_grass_10.png',
        speedY: 1,
        speedX: 1,
        offsetY: 0.8,
        scale: 0.3,
        portraitOffsetY: 0.02,
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
    hasFloorImage: true,
    layers: [
      {
        filename: 'theme_desert_0.png',
        speedY: 0.1,
        speedX: 0,
        offsetY: 0,
      },
      {
        filename: 'theme_desert_1b.png',
        speedY: 0.05,
        speedX: 0.05,
        offsetY: 0,
        offsetX: 0,
      },
      {
        filename: 'theme_desert_2.png',
        speedY: 0.1,
        speedX: 0.1,
        offsetY: -0.25,
        offsetX: -0.025,
      },
      {
        filename: 'theme_desert_1.png',
        speedY: 0.15,
        speedX: 0.15,
        offsetY: 0,
      },

      /*{
        filename: 'theme_desert_3.png',
        speedY: 0.25,
        speedX: 0.25,
        offsetY: 0.4,
        minQuality: 'high',
      },*/
      {
        filename: 'theme_desert_4.png',
        speedY: 0.3,
        speedX: 0.3,
        offsetY: 0.15,
      },
      {
        filename: 'theme_desert_5.png',
        speedY: 0.35,
        speedX: 0.35,
        offsetY: 0.5,
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
        offsetY: 0.15,
        offsetX: 0.3,
      },
      {
        filename: 'theme_desert_8.png',
        speedY: 0.5,
        speedX: 0.5,
        offsetY: 0.75,
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
