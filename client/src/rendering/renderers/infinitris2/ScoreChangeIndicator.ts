import * as PIXI from 'pixi.js-legacy';
import IPlayer from '@models/IPlayer';

export class ScoreChangeIndicator {
  private _text!: PIXI.Text;
  private _app: PIXI.Application;
  private _lastScore: number;
  constructor(app: PIXI.Application) {
    this._app = app;
    this._lastScore = 0;
  }

  create() {
    this._text = new PIXI.Text('', {
      font: 'bold italic 24px Arvo',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this._text.anchor.set(0.5, 0);
    this._text.visible = false;
    this._app.stage.addChild(this._text);
  }

  update(humanPlayer: IPlayer | undefined) {
    if (humanPlayer) {
      if (this._lastScore !== humanPlayer.score) {
        const diff = humanPlayer.score - this._lastScore;
        this._lastScore = humanPlayer.score;
        const lastText =
          this._text.alpha > 0.5 && this._text.text.length
            ? '\n' + this._text.text
            : '';
        this._text.text = (diff > 0 ? '+' : '-') + Math.abs(diff) + lastText;
        this._text.alpha = 1;
        this._text.tint = diff > 0 ? 0x00ff00 : 0xff0000;
        this._text.visible = true;
      }
      this._text.x = this._app.renderer.width / 2;
      this._text.y = this._app.renderer.height * 0.9;
    }
    if (this._text.alpha > 0) {
      this._text.alpha -= 0.01;
    } else {
      this._text.visible = false;
    }
  }
}
