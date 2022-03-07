import IGrid from '@models/IGrid';
import * as PIXI from 'pixi.js-legacy';

export class TowerIndicator {
  private _graphics: PIXI.Graphics;
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
    this._graphics = new PIXI.Graphics();
  }

  create() {
    this._app.stage.addChild(this._graphics);
    this._graphics.alpha = 0;
  }

  update(isTower: boolean, grid: IGrid, cellSize: number) {
    let towerY = 0;
    if (isTower) {
      let towerRow = 0;
      while (true) {
        if (!grid.isTower(towerRow)) {
          break;
        }
        ++towerRow;
      }
      towerY = (towerRow + 1) * cellSize;
    }

    this._graphics.y = towerY - this._graphics.height;
    this._graphics.alpha = Math.max(
      Math.min(1, this._graphics.alpha + (isTower ? 1 : -1) * 0.025),
      0
    );
  }

  render() {
    this._graphics.clear();
    this._graphics.beginFill(0xff0000, 0.2);
    this._graphics.drawRect(
      0,
      0,
      this._app.renderer.width,
      this._app.renderer.height
    );
  }
}
