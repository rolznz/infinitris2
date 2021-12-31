import * as PIXI from 'pixi.js-legacy';
import IPlayer from '@models/IPlayer';

export class Scoreboard {
  private _scoreboardText!: PIXI.Text;
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
  }

  create(_app: PIXI.Application) {
    this._scoreboardText = new PIXI.Text('', {
      font: 'bold italic 32px Arvo',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this._scoreboardText.anchor.set(1, 0);
    this._app.stage.addChild(this._scoreboardText);
  }

  update(players: IPlayer[]) {
    const playerScores = players.map((player) => ({
      nickname: player.nickname,
      score: player.score,
    }));
    playerScores.sort((a, b) => b.score - a.score);
    this._scoreboardText.text = playerScores
      .map(
        (score, index) => index + 1 + '. ' + score.nickname + ': ' + score.score
      )
      .join('\n');
    this._scoreboardText.x = this._app.renderer.width * 0.99;
    this._scoreboardText.y = this._app.renderer.height * 0.1;
  }
}
