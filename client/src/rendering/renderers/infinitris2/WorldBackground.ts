import * as PIXI from 'pixi.js-legacy';
import Camera from '@src/rendering/Camera';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
  worldBackgroundConfigs,
} from './worldBackgroundConfigs';
import { RendererQuality } from '@models/RendererQuality';
import { WorldType, WorldVariation } from '@models/WorldType';
import { resizeTexture } from '@src/rendering/resizeTexture';
import { generateGapTexture } from '@src/rendering/generateGapTexture';
import { WrappedSprite } from '@src/rendering/WrappedSprite';

export class WorldBackground {
  private _layerSprites: (WrappedSprite | undefined)[] = [];
  private _app: PIXI.Application;
  private _camera: Camera;
  private _worldConfig: WorldBackgroundConfig;
  private _rendererQuality: RendererQuality | undefined;
  private _variation: WorldVariation;
  private _enabled = true;

  constructor(
    app: PIXI.Application,
    camera: Camera,
    worldType: WorldType = 'grass',
    worldVariation: WorldVariation = 0,
    quality: RendererQuality | undefined
  ) {
    this._app = app;
    this._camera = camera;
    this._variation = worldVariation;
    quality = 'high';
    this._rendererQuality = quality;
    this._worldConfig = worldBackgroundConfigs.find(
      (config) => config.worldType === worldType
    )!;
    if (!this._worldConfig) {
      throw new Error('World config not found: ' + worldType);
    }
    for (const layer of this._worldConfig.layers) {
      if (this._isLayerRequired(layer)) {
        this._app.loader.add(this._getLayerImage(layer));
      }
    }
  }
  private _getLayerImage(layer: WorldBackgroundLayerConfig): string {
    const layerFilenameParts = layer.filename.split('.');
    if (this._variation !== 0) {
      layerFilenameParts[0] += '_variation' + this._variation;
    }
    // TODO: low and high quality versions
    /*if (this._rendererQuality === 'low') {
      layerFilenameParts[layerFilenameParts.length - 2] += '_s';
    }*/
    return `${imagesDirectory}/worlds/${
      this._worldConfig.worldType
    }/${layerFilenameParts.join('.')}`;
  }

  get config(): WorldBackgroundConfig {
    return this._worldConfig;
  }

  get variation(): WorldVariation {
    return this._variation;
  }

  destroy() {
    // TODO: release images
  }

  createImages() {
    if (!this._enabled) {
      return;
    }
    for (const layer of this._worldConfig.layers) {
      if (this._isLayerRequired(layer)) {
        this._layerSprites.push(
          new WrappedSprite(() => this._createLayerSprite(layer))
        );
      } else {
        this._layerSprites.push(undefined);
      }
    }
  }

  addChildren() {
    for (let i = 0; i < this._layerSprites.length; i++) {
      if (this._layerSprites[i]) {
        this._app.stage.addChild(...this._layerSprites[i]!.children);
      }
    }
  }

  resize() {
    for (let i = 0; i < this._layerSprites.length; i++) {
      if (!this._layerSprites[i]) {
        continue;
      }
      const sprite = this._layerSprites[i]!;
      const scale =
        (this._app.renderer.width < this._app.renderer.height
          ? this._worldConfig.layers[i].portraitScale
          : undefined) ||
        this._worldConfig.layers[i].scale ||
        1;
      console.log(this._worldConfig.layers[i].filename, 'SCALE: ', scale);
      sprite.setScale(
        Math.max(
          this._app.renderer.width / sprite.texture.width,
          (this._app.renderer.height * 0.5) / sprite.texture.height
        ) * scale
      );
      //console.log(sprite.tileScale);
      sprite.width = Math.floor(sprite.texture.width * sprite.scale);
      sprite.height = Math.floor(sprite.texture.height * sprite.scale);
    }
  }

  update(scrollX: boolean, scrollY: boolean, clampedCameraY: number) {
    for (let i = 0; i < this._layerSprites.length; i++) {
      if (!this._layerSprites[i]) {
        continue;
      }
      const sprite = this._layerSprites[i]!;

      if (scrollX) {
        sprite.x =
          this._camera.x * this._worldConfig.layers[i].speedX +
          (this._worldConfig.layers[i].offsetX || 0) * sprite.width;
      }

      const portraitOffsetY = Math.max(
        (this._app.renderer.height * 1) / this._app.renderer.width,
        1
      );

      sprite.y = Math.floor(
        //Math.max(
        (scrollY ? clampedCameraY : 0) * this._worldConfig.layers[i].speedY +
          this._app.renderer.height *
            (this._worldConfig.layers[i].offsetY +
              (this._worldConfig.layers[i].portraitOffsetY || 0) *
                portraitOffsetY)
        //this._app.renderer.height -
        //this._app.renderer.height * sprite.tileScale.y
        //this._app.renderer.height - sprite.height
        //)
      );
      // console.log(
      //   'Test',
      //   this._layerSprites[i].tileScale.y,
      //   this._camera.y * this._worldConfig.layers[i].speedY +
      //     this._app.renderer.height * this._worldConfig.layers[i].offsetY,
      //   this._app.renderer.height - this._layerSprites[i].height
      // );
    }
  }

  private _createLayerSprite = (layer: WorldBackgroundLayerConfig) => {
    const url = this._getLayerImage(layer);
    let texture = PIXI.Texture.from(url);
    /*let resizedTexture = resizeTexture(this._app.renderer, texture, 0.25);
    texture.destroy();
    texture = resizedTexture;*/
    console.log(layer.filename, texture.width, texture.height);
    if (layer.repeatGap) {
      texture = generateGapTexture(
        this._app.renderer,
        texture,
        layer.repeatGap * texture.width
      );
    }
    const sprite = new PIXI.Sprite(texture);
    sprite.x = 0;
    sprite.y = 0;
    sprite.alpha = 1;
    return sprite;
  };

  private _isLayerRequired(layer: WorldBackgroundLayerConfig) {
    // TODO: review if this is needed
    // game looks a lot worse without all layers visible,
    // might be better just to drop the asset quality
    return true;
    /*(
      !layer.minQuality ||
      this._rendererQuality === 'high' ||
      (this._rendererQuality === 'medium' && layer.minQuality === 'medium')
    )*/
  }
}
