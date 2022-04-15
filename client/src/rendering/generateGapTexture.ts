import * as PIXI from 'pixi.js-legacy';

export function generateGapTexture(
  renderer: PIXI.Renderer | PIXI.CanvasRenderer,
  texture: PIXI.Texture,
  gap: number
) {
  // thanks to https://github.com/pixijs/pixijs/issues/7189 and
  // https://stackoverflow.com/questions/46740171/how-to-create-a-texture-from-multiple-graphics
  const gapBox = new PIXI.Graphics();
  const originSprite = new PIXI.Sprite(texture);
  gapBox.drawRect(0, 0, originSprite.width + gap, originSprite.height);
  gapBox.addChild(originSprite);

  return renderer.generateTexture(
    gapBox,
    PIXI.SCALE_MODES.LINEAR,
    window.devicePixelRatio
  );
}
