import { desert } from '@src/rendering/renderers/infinitris2/backgroundConfigs/desert';
import { grass } from '@src/rendering/renderers/infinitris2/backgroundConfigs/grass';
import { space } from '@src/rendering/renderers/infinitris2/backgroundConfigs/space';
import { volcano } from '@src/rendering/renderers/infinitris2/backgroundConfigs/volcano';
import { WorldBackgroundConfig } from '@src/rendering/renderers/infinitris2/WorldBackgroundConfig';

export const worldBackgroundConfigs: WorldBackgroundConfig[] = [
  grass,
  desert,
  volcano,
  space,
];
