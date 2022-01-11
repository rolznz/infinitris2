import * as PIXI from 'pixi.js-legacy';
import { IPlayer } from '@models/IPlayer';

const placingCharacters = [
  '\u2460',
  '\u2461',
  '\u2462',
  '\u2463',
  '\u2464',
  '\u2465',
  '\u2466',
  '\u2467',
  '\u2468',
  '\u2469',
  '\u246A',
  '\u246B',
  '\u246C',
  '\u246D',
  '\u246E',
  '\u246F',
  '\u2470',
  '\u2471',
  '\u2472',
  '\u2473',
];

export class Scoreboard {
  private _scoreboardTextLines!: PIXI.Text[];
  private _textBackground!: PIXI.Sprite;
  private _scoreboardContainer!: PIXI.Container;
  private _app: PIXI.Application;
  private _lastUpdate: number = 0;
  constructor(app: PIXI.Application) {
    this._app = app;
  }

  create() {
    this._scoreboardContainer = new PIXI.Container();
    this._app.stage.addChild(this._scoreboardContainer);

    this._textBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
    this._textBackground.alpha = 0.1;
    this._textBackground.tint = 0x000000;

    this._scoreboardContainer.addChild(this._textBackground);
    this._scoreboardTextLines = [...new Array(10)].map((_, i) =>
      this._createText(i)
    );
  }

  update(players: IPlayer[], followingPlayer: IPlayer | undefined) {
    const now = Date.now();
    if (now - this._lastUpdate < 1000) {
      return;
    }
    this._lastUpdate = now;
    // TODO: ensure human player is on scoreboard
    const playerScores = players.map((player) => ({
      playerId: player.id,
      nickname: player.nickname,
      score: player.score,
      placing: 0,
      spectating: player.isSpectating,
    }));
    playerScores.sort((a, b) => b.score - a.score);
    for (let i = 0; i < playerScores.length; i++) {
      playerScores[i].placing = i + 1;
    }
    if (followingPlayer) {
      const playerScoreIndex = playerScores.findIndex(
        (score) => score.playerId === followingPlayer.id
      );
      if (playerScoreIndex > this._scoreboardTextLines.length - 1) {
        // 10 > 9
        // start at 9,
        // (10 - 9)
        // 11 > 9
        // 11 - 9 = 2
        playerScores.splice(
          this._scoreboardTextLines.length - 1,
          playerScoreIndex - (this._scoreboardTextLines.length - 1)
        );
      }
    }
    playerScores.splice(this._scoreboardTextLines.length);

    const padding = this._app.renderer.width * 0.005;
    let widestText = 0;
    let textHeight = 0;
    for (let i = 0; i < this._scoreboardTextLines.length; i++) {
      const text = this._scoreboardTextLines[i];
      if (i < playerScores.length) {
        text.visible = true;
        text.text =
          (playerScores[i].placing - 1 < placingCharacters.length
            ? placingCharacters[playerScores[i].placing - 1]
            : playerScores[i].placing) +
          '  ' +
          playerScores[i].score +
          ' ' +
          playerScores[i].nickname +
          (playerScores[i].spectating ? ' (spectating)' : '');

        text.tint =
          playerScores[i].playerId === followingPlayer?.id
            ? 0xffccff
            : 0xffffff;
        text.x = padding;
        text.y = padding + i * text.height;
        widestText = Math.max(widestText, text.width);
        textHeight += text.height;
      } else {
        text.visible = false;
      }
      this._scoreboardContainer.x =
        this._app.renderer.width * 0.995 - widestText - padding * 2;
      this._scoreboardContainer.y = this._app.renderer.height * 0.125;
      this._textBackground.width = widestText + padding * 2;
      this._textBackground.height = textHeight + padding * 2;
    }
  }

  _createText(i: number): PIXI.Text {
    const text = new PIXI.Text('', {
      font: 'bold italic 24px Arvo',
      fill: '#ffffff',
      align: 'left',
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.anchor.set(0, 0);
    text.scale.set(0.8);
    text.visible = false;

    this._scoreboardContainer.addChild(text);

    return text;
  }
}
