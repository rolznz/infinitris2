import GestureBehaviour from '@core/grid/cell/behaviours/GestureBehaviour';
import CellType from '@models/CellType';
import ControlSettings from '@models/ControlSettings';
import IBlock from '@models/IBlock';
import { CustomizableInputAction } from '@models/InputAction';
import { InputMethod } from '@models/InputMethod';
import { fontFamily } from '@models/ui';
import getUserFriendlyKeyText from '@models/util/getUserFriendlyKeyText';
import { imagesDirectory } from '@src/rendering/renderers';
import * as PIXI from 'pixi.js-legacy';

const keyTextLineHeight = 50;

export class GestureIndicator {
  private _app: PIXI.Application;
  private _virtualKeyboardGraphics?: PIXI.Graphics;
  private _virtualKeyboardCurrentKeyText!: PIXI.Text;
  private _virtualGestureSprites?: PIXI.Sprite[];
  private _preferredInputMethod: InputMethod;
  private _controls: ControlSettings;

  constructor(
    app: PIXI.Application,
    preferredInputMethod: InputMethod,
    controls: ControlSettings
  ) {
    this._app = app;
    this._preferredInputMethod = preferredInputMethod;
    this._controls = controls;
  }

  update(block: IBlock | undefined) {
    const inputAction: CustomizableInputAction | undefined = (
      block?.cells.find((cell) => cell.behaviour.type === CellType.Gesture)
        ?.behaviour as GestureBehaviour
    )?.inputAction;
    this._renderVirtualKeyboard(inputAction);
    this._renderVirtualGestures(inputAction);
  }

  async loadImages() {
    // TODO: extract from here and minimal renderer
    if (this._preferredInputMethod === 'touch') {
      const gesturesDirectory = `${imagesDirectory}/gestures`;
      const swipeLeftUrl = `${gesturesDirectory}/swipe-left.png`;
      const swipeRightUrl = `${gesturesDirectory}/swipe-right.png`;
      const swipeUpUrl = `${gesturesDirectory}/swipe-up.png`;
      const swipeDownUrl = `${gesturesDirectory}/swipe-down.png`;
      const tapUrl = `${gesturesDirectory}/tap.png`;
      this._app.loader.add(swipeLeftUrl);
      this._app.loader.add(swipeRightUrl);
      this._app.loader.add(swipeUpUrl);
      this._app.loader.add(swipeDownUrl);
      this._app.loader.add(tapUrl);
      await new Promise((resolve) => this._app.loader.load(resolve));
      const createGestureSprite = (url: string) => {
        const sprite = PIXI.Sprite.from(
          this._app.loader.resources[url].texture
        );
        sprite.anchor.set(0.5);
        sprite.alpha = 0;
        return sprite;
      };
      // one sprite is added for each input action
      this._virtualGestureSprites = [];
      this._virtualGestureSprites.push(createGestureSprite(swipeLeftUrl));
      this._virtualGestureSprites.push(createGestureSprite(swipeRightUrl));
      this._virtualGestureSprites.push(createGestureSprite(swipeDownUrl));
      this._virtualGestureSprites.push(createGestureSprite(tapUrl));
      this._virtualGestureSprites.push(createGestureSprite(tapUrl));
      this._virtualGestureSprites.push(createGestureSprite(swipeUpUrl));
    }
  }
  addChildren() {
    if (this._preferredInputMethod === 'keyboard') {
      this._virtualKeyboardGraphics = new PIXI.Graphics();
      this._app.stage.addChild(this._virtualKeyboardGraphics);

      this._virtualKeyboardCurrentKeyText = new PIXI.Text('', {
        fontFamily,
        fill: '#444444',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2,
        letterSpacing: 2,
        lineHeight: keyTextLineHeight,
      } as PIXI.TextStyle);
      this._app.stage.addChild(this._virtualKeyboardCurrentKeyText);
    }

    if (this._preferredInputMethod === 'touch') {
      this._app.stage.addChild(...this._virtualGestureSprites);
    }
  }

  private _renderVirtualKeyboard(
    inputAction: CustomizableInputAction | undefined
  ) {
    if (!this._virtualKeyboardGraphics) {
      return;
    }
    this._virtualKeyboardGraphics.clear();
    this._virtualKeyboardCurrentKeyText.text = '';

    if (!inputAction) {
      return;
    }

    const key = this._controls[inputAction];
    const keySymbol = getUserFriendlyKeyText(key);
    const keyHeight = this._app.renderer.width * 0.05;
    const keyWidth = (1 + (keySymbol.length - 1) * 0.2) * keyHeight;
    const keyPadding = keyHeight * 0.1;

    const x =
      this._app.renderer.width - this._app.renderer.height * 0.1 - keyWidth;
    const y = this._app.renderer.height * 0.9 - keyHeight;
    this._virtualKeyboardCurrentKeyText.text = keySymbol;
    this._virtualKeyboardCurrentKeyText.x = x + keyWidth * 0.5;
    this._virtualKeyboardCurrentKeyText.y =
      y + keyHeight * 0.5 + keyTextLineHeight * 0.125;
    this._virtualKeyboardCurrentKeyText.anchor.x = 0.5;
    this._virtualKeyboardCurrentKeyText.anchor.y = 0.5;

    this._virtualKeyboardGraphics.beginFill(0xcccccc);
    this._virtualKeyboardGraphics.drawRect(
      x + keyPadding - keyHeight * 0.05,
      y + keyPadding + keyHeight * 0.1,
      keyWidth - keyPadding * 2 + keyHeight * 0.1,
      keyHeight - keyPadding * 2
    );

    this._virtualKeyboardGraphics.beginFill(0xffffff);
    this._virtualKeyboardGraphics.drawRect(
      x + keyPadding,
      y + keyPadding,
      keyWidth - keyPadding * 2,
      keyHeight - keyPadding * 2
    );
  }

  private _renderVirtualGestures(
    inputAction: CustomizableInputAction | undefined
  ) {
    if (!this._virtualGestureSprites) {
      return;
    }
    // TODO: store last landed on action
    this._virtualGestureSprites.forEach((sprite, i) => {
      sprite.x =
        this._app.renderer.width *
        (inputAction === CustomizableInputAction.RotateAnticlockwise
          ? 0.25
          : inputAction === CustomizableInputAction.RotateClockwise
          ? 0.75
          : 0.5);
      sprite.y = this._app.renderer.height * 0.75;
      sprite.alpha =
        inputAction &&
        Object.values(CustomizableInputAction).indexOf(inputAction) === i
          ? 1
          : 0;
    });
  }
}