import * as PIXI from 'pixi.js-legacy';

export class FullLineClearIndicator {
  private _lines: {
    graphics: PIXI.Graphics;
    isClearing: boolean;
  }[];
  private _app: PIXI.Application;
  constructor(app: PIXI.Application) {
    this._app = app;
    this._lines = [];
  }

  setLineClearing(row: number, isClearing: boolean) {
    if (this._lines[row]) {
      this._lines[row].isClearing = isClearing;
    }
  }

  update(gridY: number, cellSize: number) {
    for (let i = 0; i < this._lines.length; i++) {
      const line = this._lines[i];
      line.graphics.y = gridY + i * cellSize;
      line.graphics.alpha = line.isClearing ? 1 : 0;
    }
  }

  create() {
    // reset so lines will be re-added on next render
    this._lines.length = 0;
  }

  render(
    numRows: number,
    cellSize: number,
    clearColor1: number,
    clearColor2: number
  ) {
    for (let i = 0; i < numRows; i++) {
      let graphics: PIXI.Graphics;
      if (this._lines.length < numRows) {
        graphics = new PIXI.Graphics();
        this._lines.push({
          graphics,
          isClearing: false,
        });
        this._app.stage.addChild(graphics);
      } else {
        graphics = this._lines[i].graphics;
      }
      graphics.alpha = 0;
      graphics.clear();
      graphics.beginFill(clearColor1, 0.75);
      graphics.lineStyle(cellSize * 0.1, clearColor2, 0.05);
      graphics.drawRect(0, 0, this._app.renderer.width, cellSize);
    }
  }
}
