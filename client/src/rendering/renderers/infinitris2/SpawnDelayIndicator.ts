import * as PIXI from 'pixi.js-legacy';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import { fontFamily } from '@models/ui';

export class SpawnDelayIndicator {
  private _spawnDelayText!: PIXI.Text;
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
  }

  create() {
    this._spawnDelayText = new PIXI.Text('', {
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily,
      fontSize: 32,
    });
    this._spawnDelayText.anchor.set(0.5, 0.5);
    this._spawnDelayText.visible = false;
    this._app.stage.addChild(this._spawnDelayText);
  }

  update(simulation: ISimulation, humanPlayer: IPlayer | undefined) {
    this._spawnDelayText.x = this._app.renderer.width / 2;
    this._spawnDelayText.y = this._app.renderer.height / 2;
    if (
      humanPlayer &&
      humanPlayer.status === PlayerStatus.ingame &&
      !humanPlayer.block &&
      humanPlayer.estimatedSpawnDelay > 500
    ) {
      this._spawnDelayText.text =
        'Next Block\n' + Math.ceil(humanPlayer.estimatedSpawnDelay / 1000);
      this._spawnDelayText.visible = true;
    } else if (humanPlayer && simulation.round?.isWaitingForNextRound) {
      if (simulation.players.length > 1) {
        const round = simulation.round!;
        this._spawnDelayText.text =
          'Next Round\n' +
          Math.ceil(Math.max(round.nextRoundTime - Date.now(), 0) / 1000);
        if (round.winner) {
          this._spawnDelayText.text =
            round.winner.nickname + ' wins!\n\n' + this._spawnDelayText.text;
        }
      } else {
        this._spawnDelayText.text = 'Waiting for players';
      }
      this._spawnDelayText.visible = true;
    } else {
      this._spawnDelayText.visible = false;
    }
  }
}
