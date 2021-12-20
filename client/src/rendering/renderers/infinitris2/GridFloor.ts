import * as PIXI from 'pixi.js-legacy';
import Camera from '@src/rendering/Camera';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
  worldBackgroundConfigs,
} from './worldBackgroundConfigs';

export class GridFloor {
  private _floorSprite!: PIXI.TilingSprite;
  private _glowSprite!: PIXI.TilingSprite;
  private _app: PIXI.Application;
  private _camera: Camera;
  private _worldConfig: WorldBackgroundConfig;

  constructor(app: PIXI.Application, camera: Camera, worldName: string) {
    this._app = app;
    this._camera = camera;
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

  createImages() {
    this._floorSprite = this._createSprite(this._getFloorImageFilename());
    this._glowSprite = this._createSprite(this._getGlowImageFilename());
  }

  addChildren() {
    this._app.stage.addChild(this._floorSprite);
    this._app.stage.addChild(this._glowSprite);
  }

  update(gridBottom: number) {
    this._floorSprite.y = Math.ceil(gridBottom);
    this._glowSprite.y = Math.ceil(gridBottom - this._glowSprite.height);
  }

  private _createSprite = (url: string) => {
    const texture = PIXI.Texture.from(url);
    const sprite = new PIXI.TilingSprite(texture);

    // sprite.tileScale.set(
    //   Math.max(
    //     this._app.renderer.width / texture.width,
    //     this._app.renderer.height / texture.height
    //     //1
    //   )
    // );
    console.log(sprite.tileScale);
    sprite.width = Math.floor(this._app.renderer.width);
    // TODO: grid cell height
    sprite.height = texture.height; //Math.floor(texture.height * sprite.tileScale.x);

    sprite.x = 0;
    sprite.y = 0;
    sprite.alpha = 1;
    return sprite;
  };
}
