import * as PIXI from 'pixi.js-legacy';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import { ConquestGameMode } from '@core/gameModes/ConquestGameMode';
import { fontFamily } from '@models/ui';

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

  update(
    players: IPlayer[],
    followingPlayer: IPlayer | undefined,
    simulation: ISimulation
  ) {
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
      isSpectating: player.isSpectating,
      color: player.color,
      numCaptures:
        simulation.settings.gameModeType === 'conquest'
          ? (simulation.gameMode as ConquestGameMode).columnCaptures.filter(
              (c) => c.playerId === player.id
            ).length
          : 0,
      health:
        simulation.settings.gameModeType === 'conquest'
          ? Math.floor(
              ((simulation.gameMode as ConquestGameMode).playerHealths[
                player.id
              ] || 0) * 100
            )
          : 0,
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
        text.text = playerScores[i].isSpectating
          ? ''
          : (playerScores[i].placing - 1 < placingCharacters.length
              ? placingCharacters[playerScores[i].placing - 1]
              : playerScores[i].placing) +
            '  ' +
            playerScores[i].nickname +
            (playerScores[i].isSpectating ? ' (spectating)' : '') +
            (!playerScores[i].isSpectating &&
            simulation.settings.gameModeType === 'conquest'
              ? ` (${playerScores[i].numCaptures} ⦿ ${playerScores[i].health} ♥)`
              : '') +
            (playerScores[i].isSpectating ? '' : '  ' + playerScores[i].score);

        text.tint = playerScores[i].color;
        text.x = padding;
        text.y = padding + i * text.height;
        if (playerScores[i].playerId === followingPlayer?.id) {
          (text.style as PIXI.TextStyle).fontWeight = '900';
        } else {
          (text.style as PIXI.TextStyle).fontWeight = '300';
        }
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
      fill: '#ffffff',
      align: 'left',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily,
    } as Partial<PIXI.TextStyle>);
    text.anchor.set(0, 0);
    text.scale.set(0.8);
    text.visible = false;

    this._scoreboardContainer.addChild(text);

    return text;
  }
}
