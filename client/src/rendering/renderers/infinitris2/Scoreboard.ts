import * as PIXI from 'pixi.js-legacy';
import IPlayer from '@models/IPlayer';

export class Scoreboard {
  private _scoreboardText!: PIXI.Text;
  private _textBackground!: PIXI.Sprite;
  private _scoreboardContainer!: PIXI.Container;
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
  }

  create() {
    this._scoreboardText = new PIXI.Text('', {
      font: 'bold italic 24px Arvo',
      fill: '#ffffff',
      align: 'left',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this._scoreboardText.anchor.set(0, 0);
    this._scoreboardText.scale.set(0.8);

    this._scoreboardContainer = new PIXI.Container();
    this._app.stage.addChild(this._scoreboardContainer);

    this._textBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._textBackground.alpha = 0.1;
    this._textBackground.tint = 0x000000;

    this._scoreboardContainer.addChild(this._textBackground);
    this._scoreboardContainer.addChild(this._scoreboardText);
  }

  update(players: IPlayer[]) {
    const playerScores = players.map((player) => ({
      nickname: player.nickname,
      score: player.score,
    }));
    playerScores.sort((a, b) => b.score - a.score);
    this._scoreboardText.text = playerScores
      .map((score) => score.score + ' ' + score.nickname)
      .join('\n');

    const padding = this._app.renderer.width * 0.005;
    this._scoreboardText.x = padding;
    this._scoreboardText.y = padding;
    this._scoreboardContainer.x =
      this._app.renderer.width * 0.995 -
      this._scoreboardText.width -
      padding * 2;
    this._scoreboardContainer.y = this._app.renderer.height * 0.125;
    this._textBackground.width = this._scoreboardText.width + padding * 2;
    this._textBackground.height = this._scoreboardText.height + padding * 2;
  }
}
