import * as PIXI from 'pixi.js-legacy';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
} from './WorldBackgroundConfig';
import { WorldType, WorldVariation } from '@models/WorldType';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { WrappedSprite } from '@src/rendering/WrappedSprite';
import { worldBackgroundConfigs } from '@src/rendering/renderers/infinitris2/backgroundConfigs/worldBackgroundConfigs';

export class GridFloor {
  private _gridFloorGraphics: PIXI.Graphics | undefined;
  private _floorSprite: WrappedSprite | undefined;
  private _glowSprite!: PIXI.Sprite;
  private _app: PIXI.Application;
  private _worldConfig: WorldBackgroundConfig;
  private _worldVariation: WorldVariation;
  private _enabled = true;
  private _renderer: BaseRenderer;
  private _useImages: boolean;

  constructor(
    renderer: BaseRenderer,
    app: PIXI.Application,
    worldType: WorldType,
    worldVariation: WorldVariation,
    useImages = true
  ) {
    this._renderer = renderer;
    this._useImages = useImages;
    this._app = app;
    this._worldConfig = worldBackgroundConfigs.find(
      (config) => config.worldType === worldType
    )!;
    this._worldVariation = worldVariation;

    if (useImages) {
      this._app.loader.add(this._getFloorImageFilename());
      this._app.loader.add(this._getGlowImageFilename());
    }
    if (!this._worldConfig.hasFloorImage || !useImages) {
      this._gridFloorGraphics = new PIXI.Graphics();
    }
  }
  private _getFloorImageFilename(): string {
    // TODO: copied from world background
    let floorImageName = `${imagesDirectory}/worlds/${this._worldConfig.worldType}/theme_${this._worldConfig.worldType}_floor`;
    if (this._worldVariation !== '0') {
      floorImageName += '_variation' + this._worldVariation;
    }
    floorImageName += '.png';
    return floorImageName;
  }
  private _getGlowImageFilename(): string {
    // TODO: copied from world background
    return `${imagesDirectory}/worlds/${this._worldConfig.worldType}/floor_glow.png`;
  }

  destroy() {
    // TODO: release images
  }

  createImages() {
    if (this._worldConfig.hasFloorImage && this._useImages) {
      this._floorSprite = new WrappedSprite(() =>
        this._createSprite(
          this._getFloorImageFilename()
          //true
        )
      );
    }
    if (this._useImages) {
      this._glowSprite = this._createSprite(this._getGlowImageFilename());
      this._glowSprite.tint = 0x0c2d21; // TODO: make it per-world
    }

    if (
      (this._worldConfig.floorColor || !this._useImages) &&
      this._gridFloorGraphics
    ) {
      const floorGraphicsHeight = 267;
      const colorRgb = PIXI.utils.hex2rgb(
        this._useImages ? this._worldConfig.floorColor : 0x444444
      );
      for (let y = 0; y < floorGraphicsHeight; y++) {
        this._gridFloorGraphics.beginFill(
          PIXI.utils.rgb2hex(
            colorRgb.map((c) => c * Math.pow(1 - y / floorGraphicsHeight, 1.5))
          )
        );
        this._gridFloorGraphics.drawRect(0, y, 1, 1);
      }
    }
  }

  addChildren() {
    if (!this._enabled) {
      return;
    }
    if (this._floorSprite) {
      this._app.stage.addChild(...this._floorSprite.children);
    }
    if (this._gridFloorGraphics) {
      this._app.stage.addChild(this._gridFloorGraphics);
    }
    if (this._glowSprite) {
      this._app.stage.addChild(this._glowSprite);
    }
  }

  update(cameraX: number, gridBottom: number) {
    if (this._floorSprite) {
      this._floorSprite.x = cameraX;
    }
    if (this._floorSprite) {
      this._floorSprite.y = Math.floor(gridBottom);
    }
    if (this._gridFloorGraphics) {
      this._gridFloorGraphics.y = Math.floor(gridBottom) + 1;
    }
    if (this._glowSprite) {
      this._glowSprite.y = Math.floor(gridBottom - this._glowSprite.height) + 1;
    }
  }

  resize(floorHeight: number) {
    [this._floorSprite, this._gridFloorGraphics, this._glowSprite].forEach(
      (child) => {
        if (child) {
          child.width = this._app.renderer.width;
        }
      }
    );
    if (this._floorSprite) {
      this._floorSprite.height = floorHeight + 2;
      this._floorSprite.setScale(
        this._floorSprite.height / this._floorSprite.texture.height
      );
    }
    if (this._gridFloorGraphics) {
      this._gridFloorGraphics.height = floorHeight;
    }
    if (this._glowSprite) {
      this._glowSprite.height = floorHeight * 0.25;
    }
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
