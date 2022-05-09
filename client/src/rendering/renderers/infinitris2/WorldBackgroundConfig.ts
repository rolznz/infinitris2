import { RendererQuality } from '@models/RendererQuality';
import { WorldType } from '@models/WorldType';

export type WorldBackgroundLayerConfig = {
  filename: string;
  speedY: number;
  speedX: number;
  offsetX?: number;
  offsetY: number;
  portraitOffsetY?: number;
  portraitScale?: number;
  //minQuality?: RendererQuality; // optional layers that will only show when the quality is high enough. Unset = required on all layers
  scale?: number;
  repeatGap?: number; // TODO: this needs to be different on mobile
};

export type WorldBackgroundConfig = {
  layers: WorldBackgroundLayerConfig[];
  worldType: WorldType;
  floorColor: number;
  hasFloorImage?: boolean;
  blockOutlineColor?: number;
};
