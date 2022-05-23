import { WorldBackgroundConfig } from '@src/rendering/renderers/infinitris2/WorldBackgroundConfig';

export const grass: WorldBackgroundConfig = {
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
      offsetY: 0.78,
      scale: 0.5,
      portraitOffsetY: 0.02,
    },
  ],
};