import * as PIXI from 'pixi.js-legacy';
import Camera from '@src/rendering/Camera';
import { imagesDirectory } from '..';
import {
  WorldBackgroundLayerConfig,
  WorldBackgroundConfig,
  worldBackgroundConfigs,
} from './worldBackgroundConfigs';
import { RendererQuality } from '@models/RendererQuality';
import { WorldType } from '@models/WorldType';

export class WorldBackground {
  private _layerSprites: (PIXI.TilingSprite | undefined)[] = [];
  private _app: PIXI.Application;
  private _camera: Camera;
  private _worldConfig: WorldBackgroundConfig;
  private _rendererQuality: RendererQuality | undefined;

  constructor(
    app: PIXI.Application,
    camera: Camera,
    worldType: WorldType,
    quality: RendererQuality | undefined
  ) {
    this._app = app;
    this._camera = camera;
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
    if (this._rendererQuality === 'low') {
      layerFilenameParts[layerFilenameParts.length - 2] += '_s';
    }
    return `${imagesDirectory}/worlds/${
      this._worldConfig.worldType
    }/${layerFilenameParts.join('.')}`;
  }

  destroy() {
    // TODO: release images
  }

  createImages() {
    for (const layer of this._worldConfig.layers) {
      if (this._isLayerRequired(layer)) {
        this._layerSprites.push(this._createLayerSprite(layer));
      } else {
        this._layerSprites.push(undefined);
      }
    }
  }

  addChildren() {
    for (let i = 0; i < this._layerSprites.length; i++) {
      if (this._layerSprites[i]) {
        this._app.stage.addChild(this._layerSprites[i]!);
      }
    }
  }

  update(scrollX: boolean, scrollY: boolean, clampedCameraY: number) {
    for (let i = 0; i < this._layerSprites.length; i++) {
      if (!this._layerSprites[i]) {
        continue;
      }
      if (scrollX) {
        this._layerSprites[i]!.tilePosition.x =
          this._camera.wrappedX * this._worldConfig.layers[i].speedX;
      }
      this._layerSprites[i]!.y = Math.floor(
        Math.max(
          (scrollY ? clampedCameraY : 0) * this._worldConfig.layers[i].speedY +
            this._app.renderer.height * this._worldConfig.layers[i].offsetY,
          //this._app.renderer.height -
          //this._app.renderer.height * this._layerSprites[i].tileScale.y
          this._app.renderer.height - this._layerSprites[i]!.height
        )
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
    const texture = PIXI.Texture.from(url);
    const sprite = new PIXI.TilingSprite(texture);
    //console.log(url, texture.width, texture.height);
    sprite.tileScale.set(
      Math.max(
        this._app.renderer.width / texture.width,
        this._app.renderer.height / texture.height
        //1
      )
    );
    //console.log(sprite.tileScale);
    sprite.width = Math.floor(texture.width * sprite.tileScale.x);
    sprite.height = Math.floor(texture.height * sprite.tileScale.x);

    sprite.x = 0;
    sprite.y = 0;
    sprite.alpha = 1;
    return sprite;
  };

  private _isLayerRequired(layer: WorldBackgroundLayerConfig) {
    return (
      !layer.minQuality ||
      this._rendererQuality === 'high' ||
      (this._rendererQuality === 'medium' && layer.minQuality === 'medium')
    );
  }
}
