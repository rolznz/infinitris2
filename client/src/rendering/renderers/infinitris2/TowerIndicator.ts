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

  hide() {
    this._graphics.alpha = 0;
  }

  update(gridY: number, isTower: boolean, grid: IGrid, cellSize: number) {
    let towerY = 0;
    if (isTower) {
      let towerRow = 0;
      while (true) {
        if (!grid.isTower(towerRow)) {
          break;
        }
        ++towerRow;
      }
      towerY = towerRow * cellSize;
      this._graphics.alpha = Math.max(
        Math.min(1, this._graphics.alpha + 0.025),
        0
      );
    } else {
      this.hide();
    }

    this._graphics.y = gridY + towerY - this._graphics.height;
  }

  render(cellSize: number) {
    this._graphics.clear();
    this._graphics.beginFill(0xff0000, 0.0); // fake fill just to make sure graphics height is correct - pixi bug?
    this._graphics.drawRect(
      0,
      0,
      this._app.renderer.width,
      this._app.renderer.height
    );
    this._graphics.beginFill(0xff0000, 0.4);
    const dashHeight = cellSize * 0.1;
    const dashWidth = cellSize * 0.3;
    const dashPadding = dashHeight;
    for (
      let i = 0;
      i < this._app.renderer.width;
      i += dashWidth + dashPadding * 2
    ) {
      this._graphics.drawRect(
        i + dashPadding,
        this._app.renderer.height - dashHeight * 0.5,
        dashWidth,
        dashHeight
      );
    }
  }
}
