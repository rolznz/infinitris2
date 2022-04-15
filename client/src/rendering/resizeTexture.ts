import * as PIXI from 'pixi.js-legacy';

export function resizeTexture(
  renderer: PIXI.Renderer | PIXI.CanvasRenderer,
  texture: PIXI.Texture,
  scale: number
) {
  const gapBox = new PIXI.Graphics();
  const originSprite = new PIXI.Sprite(texture);
  originSprite.scale.set(scale);
  gapBox.drawRect(
    0,
    0,
    originSprite.width * scale,
    originSprite.height * scale
  );
  gapBox.addChild(originSprite);

  return renderer.generateTexture(
    gapBox,
    PIXI.SCALE_MODES.LINEAR,
    window.devicePixelRatio
  );
}
