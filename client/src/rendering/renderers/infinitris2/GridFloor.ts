import * as PIXI from 'pixi.js-legacy';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
  worldBackgroundConfigs,
} from './worldBackgroundConfigs';
import { WorldType } from '@models/WorldType';

export class GridFloor {
  private _gridFloorGraphics: PIXI.Graphics;
  private _glowSprite!: PIXI.Sprite;
  private _app: PIXI.Application;
  private _worldConfig: WorldBackgroundConfig;

  constructor(app: PIXI.Application, worldType: WorldType) {
    this._app = app;
    this._worldConfig = worldBackgroundConfigs.find(
      (config) => config.worldType === worldType
    )!;

    this._app.loader.add(this._getGlowImageFilename());
    this._gridFloorGraphics = new PIXI.Graphics();
  }
  private _getGlowImageFilename(): string {
    // TODO: copied from world background
    return `${imagesDirectory}/worlds/${this._worldConfig.worldType}/floor_glow.png`;
  }

  destroy() {
    // TODO: release images
  }

  createImages() {
    this._glowSprite = this._createSprite(this._getGlowImageFilename());
    this._glowSprite.tint = 0;

    const floorGraphicsHeight = 267;
    const colorRgb = PIXI.utils.hex2rgb(this._worldConfig.floorColor);
    for (let y = 0; y < floorGraphicsHeight; y++) {
      this._gridFloorGraphics.beginFill(
        PIXI.utils.rgb2hex(
          colorRgb.map((c) => c * Math.pow(1 - y / floorGraphicsHeight, 1.5))
        )
      );
      this._gridFloorGraphics.drawRect(0, y, 1, 1);
    }
  }

  addChildren() {
    this._app.stage.addChild(this._gridFloorGraphics);
    this._app.stage.addChild(this._glowSprite);
  }

  update(gridBottom: number) {
    this._gridFloorGraphics.y = Math.floor(gridBottom) + 1;
    this._glowSprite.y = Math.floor(gridBottom - this._glowSprite.height) + 1;
  }

  resize(floorHeight: number) {
    [this._gridFloorGraphics, this._glowSprite].forEach((sprite) => {
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
