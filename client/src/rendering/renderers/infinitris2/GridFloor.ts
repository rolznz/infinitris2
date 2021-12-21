import * as PIXI from 'pixi.js-legacy';
import Camera from '@src/rendering/Camera';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
  worldBackgroundConfigs,
} from './worldBackgroundConfigs';

export class GridFloor {
  private _floorSprite!: PIXI.Sprite;
  private _glowSprite!: PIXI.Sprite;
  private _app: PIXI.Application;
  private _worldConfig: WorldBackgroundConfig;

  constructor(app: PIXI.Application, worldName: string) {
    this._app = app;
    this._worldConfig = worldBackgroundConfigs.find(
      (config) => config.worldName === worldName
    )!;

    this._app.loader.add(this._getFloorImageFilename());
    this._app.loader.add(this._getGlowImageFilename());
  }
  private _getFloorImageFilename(): string {
    // TODO: copied from world background
    return `${imagesDirectory}/worlds/${this._worldConfig.worldName}/floor.png`;
  }
  private _getGlowImageFilename(): string {
    // TODO: copied from world background
    return `${imagesDirectory}/worlds/${this._worldConfig.worldName}/floor_glow.png`;
  }

  destroy() {
    // TODO: release images
  }

  createImages(floorHeight: number) {
    this._floorSprite = this._createSprite(
      this._getFloorImageFilename(),
      floorHeight
    );
    this._glowSprite = this._createSprite(
      this._getGlowImageFilename(),
      floorHeight
    );
  }

  addChildren() {
    this._app.stage.addChild(this._floorSprite);
    this._app.stage.addChild(this._glowSprite);
  }

  update(gridBottom: number) {
    this._floorSprite.y = Math.floor(gridBottom);
    this._glowSprite.y = Math.floor(gridBottom - this._glowSprite.height);
  }

  private _createSprite = (url: string, floorHeight: number) => {
    const texture = PIXI.Texture.from(url);
    const sprite = new PIXI.Sprite(texture);

    // sprite.tileScale.set(
    //   Math.max(
    //     this._app.renderer.width / texture.width,
    //     this._app.renderer.height / texture.height
    //     //1
    //   )
    // );
    sprite.width = this._app.renderer.width;
    // TODO: grid cell height
    sprite.height = floorHeight; //texture.height; //Math.floor(texture.height * sprite.tileScale.x);

    sprite.x = 0;
    sprite.y = 0;
    sprite.alpha = 1;
    return sprite;
  };
}
