import * as PIXI from 'pixi.js-legacy';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
  worldBackgroundConfigs,
} from './worldBackgroundConfigs';
import { WorldType } from '@models/WorldType';

export class GridFloor {
  private _floorSprite!: PIXI.Sprite;
  private _glowSprite!: PIXI.Sprite;
  private _app: PIXI.Application;
  private _worldConfig: WorldBackgroundConfig;

  constructor(app: PIXI.Application, worldType: WorldType) {
    this._app = app;
    this._worldConfig = worldBackgroundConfigs.find(
      (config) => config.worldType === worldType
    )!;

    this._app.loader.add(this._getFloorImageFilename());
    this._app.loader.add(this._getGlowImageFilename());
  }
  private _getFloorImageFilename(): string {
    // TODO: copied from world background
    return `${imagesDirectory}/worlds/${this._worldConfig.worldType}/floor.png`;
  }
  private _getGlowImageFilename(): string {
    // TODO: copied from world background
    return `${imagesDirectory}/worlds/${this._worldConfig.worldType}/floor_glow.png`;
  }

  destroy() {
    // TODO: release images
  }

  createImages() {
    this._floorSprite = this._createSprite(this._getFloorImageFilename());
    this._glowSprite = this._createSprite(this._getGlowImageFilename());
    this._glowSprite.tint = 0;
  }

  addChildren() {
    this._app.stage.addChild(this._floorSprite);
    this._app.stage.addChild(this._glowSprite);
  }

  update(gridBottom: number) {
    this._floorSprite.y = Math.floor(gridBottom);
    this._glowSprite.y = Math.floor(gridBottom - this._glowSprite.height);
  }

  resize(floorHeight: number) {
    [this._floorSprite, this._glowSprite].forEach((sprite) => {
      sprite.width = this._app.renderer.width;
      sprite.height = floorHeight;
    });
  }

  private _createSprite = (url: string) => {
    const texture = PIXI.Texture.from(url);
    const sprite = new PIXI.Sprite(texture);

    sprite.x = 0;
    sprite.y = 0;
    sprite.alpha = 1;
    return sprite;
  };
}
