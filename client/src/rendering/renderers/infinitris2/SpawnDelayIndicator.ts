import * as PIXI from 'pixi.js-legacy';
import { IPlayer } from '@models/IPlayer';

export class SpawnDelayIndicator {
  private _spawnDelayText!: PIXI.Text;
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
  }

  create() {
    this._spawnDelayText = new PIXI.Text('', {
      font: 'bold italic 24px Arvo',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this._spawnDelayText.anchor.set(0.5, 0.5);
    this._spawnDelayText.visible = false;
    this._app.stage.addChild(this._spawnDelayText);
  }

  update(humanPlayer: IPlayer | undefined) {
    if (
      humanPlayer &&
      !humanPlayer.block &&
      humanPlayer.estimatedSpawnDelay > 500
    ) {
      this._spawnDelayText.x = this._app.renderer.width / 2;
      this._spawnDelayText.y = this._app.renderer.height / 2;
      this._spawnDelayText.text =
        'Next Block\n' + Math.ceil(humanPlayer.estimatedSpawnDelay / 1000);
      this._spawnDelayText.visible = true;
    } else {
      this._spawnDelayText.visible = false;
    }
  }
}
