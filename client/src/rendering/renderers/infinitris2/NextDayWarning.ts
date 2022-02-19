import * as PIXI from 'pixi.js-legacy';
import { fontFamily } from '@models/ui';

export class NextDayWarning {
  private _text!: PIXI.Text;
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
  }

  create() {
    this._text = new PIXI.Text('', {
      fill: '#ffdd00',
      align: 'center',
      fontFamily,
      fontSize: 36,
      dropShadow: true,
      dropShadowAngle: Math.PI / 2,
      dropShadowDistance: 1,
      dropShadowBlur: 2,
    });
    this._text.anchor.set(0.5, 0);
    this._text.visible = false;
    this._app.stage.addChild(this._text);
  }

  update(secondsUntilNextDay: number) {
    if (secondsUntilNextDay < 4 && secondsUntilNextDay > 0) {
      this._text.text = 'NEXT DAY IN ' + Math.floor(secondsUntilNextDay);
      this._text.alpha = 1;
      this._text.visible = true;
    } else {
      this._text.text = 'NEXT DAY';
    }
    this._text.x = this._app.renderer.width / 2;
    this._text.y = this._app.renderer.height * 0.05;
    if (this._text.alpha > 0) {
      this._text.alpha -= 0.01;
    } else {
      this._text.visible = false;
    }
  }
}
