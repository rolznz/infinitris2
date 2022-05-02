// Pixi tilingsprite is SUPER slow. Mostly infinitris just needs a wrapped sprite (requires 2 sprites)
// https://github.com/pixijs/pixijs/issues/4262
// https://www.html5gamedevs.com/topic/30149-tilingsprite-performance/
/*
WebGL test using Spector.js:

ORIGINAL (Tiling sprite for all world background layers + ground layer)
Commands Summary
total: 138
draw: 13
clear: 1

Average 81% GPU

With WrappedSprite:
Commands Summary
total: 11
draw: 1
clear: 1

Average 71% GPU
*/

import { wrap } from '@core/utils/wrap';

export class WrappedSprite {
  private _sprites: PIXI.Sprite[];

  constructor(createSpriteFunc: () => PIXI.Sprite) {
    this._sprites = [0, 1].map(createSpriteFunc);
  }

  set width(width: number) {
    this._sprites.forEach((sprite) => (sprite.width = width));
  }

  get width(): number {
    return this._sprites[0].width;
  }

  set x(x: number) {
    const wrappedX = wrap(x, this._sprites[0].width);
    this._sprites.forEach(
      (sprite, index) => (sprite.x = wrappedX + (index - 1) * sprite.width)
    );
  }

  set y(y: number) {
    this._sprites.forEach((sprite) => (sprite.y = y));
  }

  get y(): number {
    return this._sprites[0].y;
  }

  set height(height: number) {
    this._sprites.forEach((sprite) => (sprite.height = height));
  }

  get height(): number {
    return this._sprites[0].height;
  }

  get children(): PIXI.Sprite[] {
    return this._sprites;
  }

  get texture() {
    return this._sprites[0].texture;
  }

  get scale(): number {
    return this._sprites[0].scale.x;
  }

  setScale(scale: number) {
    this._sprites.forEach((sprite) => sprite.scale.set(scale));
  }
}
