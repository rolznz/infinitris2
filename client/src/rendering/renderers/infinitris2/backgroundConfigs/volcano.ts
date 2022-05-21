import { WorldBackgroundConfig } from '@src/rendering/renderers/infinitris2/WorldBackgroundConfig';

export const volcano: WorldBackgroundConfig = {
  worldType: 'volcano',
  floorColor: 0xffaa00,
  blockOutlineColor: 0xffaa66,
  hasFloorImage: true,
  layers: [
    {
      filename: 'theme_volcano_0.png',
      speedY: 0.1,
      speedX: 0,
      offsetY: 0,
    },
    {
      filename: 'theme_volcano_1.png',
      speedY: 0.05,
      speedX: 0.05,
      offsetY: 0,
    },
    /*{
      filename: 'theme_volcano_2.png',
      speedY: 0.2,
      speedX: 0.2,
      offsetY: 0,
      
    }*/
    {
      filename: 'theme_volcano_3.png',
      speedY: 0.2,
      speedX: 0.2,
      offsetY: 0.4,
      //portraitOffsetY: 0.01,
      portraitOffsetY: -0.06,
    },
    {
      filename: 'theme_volcano_4.png',
      speedY: 0.25,
      speedX: 0.25,
      offsetY: 0.5,
      portraitOffsetY: -0.07,
      //offsetX: -0.2,
      //offsetY: -0.2,
      //portraitOffsetY: 0.1,
    },
    {
      filename: 'theme_volcano_5.png',
      speedY: 0.3,
      speedX: 0.3,
      offsetY: -0.1,
      portraitOffsetY: 0.15,
    },
    {
      filename: 'theme_volcano_6.png',
      speedY: 0.5,
      speedX: 0.5,
      offsetY: 0.6,
      //offsetX: 0.1,
      //portraitOffsetY: 0.2,
      portraitOffsetY: 0.02,
    },
    {
      filename: 'theme_volcano_7.png',
      speedY: 0.6,
      speedX: 0.6,
      offsetY: 0.7,
      portraitOffsetY: 0.02,
      /*offsetX: 0.05,
      repeatGap: 0.5,
      scale: 1,
      portraitOffsetY: 0.13,*/
    },
    /*{
      filename: 'theme_volcano_8.png',
      speedY: 0.8,
      speedX: 0.8,
      offsetY: 0.2,
      //portraitOffsetY: 0.08,
    }*/
  ],
};
