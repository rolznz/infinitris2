import * as PIXI from 'pixi.js-legacy';
import IGrid, { GridLineType } from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import Camera from '@src/rendering/Camera';
export class GridLines {
  private _grid: IGrid;
  private _graphics: PIXI.Graphics;
  private _camera: Camera;
  private _app: PIXI.Application;
  private _lineType: GridLineType;

  constructor(
    simulation: ISimulation,
    app: PIXI.Application,
    camera: Camera,
    lineType: GridLineType = 'none'
  ) {
    this._app = app;
    this._grid = simulation.grid;
    this._lineType = lineType;
    this._graphics = new PIXI.Graphics();
    this._camera = camera;
    if (this._lineType === 'none') {
      return;
    }
    app.stage.addChild(this._graphics);
  }

  get y() {
    return this._graphics.y;
  }

  render(
    cellSize: number,
    cellPadding: number,
    scrollX: boolean,
    scrollY: boolean
  ) {
    if (this._lineType === 'none') {
      return;
    }
    this._graphics.cacheAsBitmap = false;
    this._graphics.clear();

    const gridRows = scrollY
      ? Math.ceil(this._app.renderer.height / cellSize) + 2
      : this._grid.numRows;
    const gridColumns = scrollX
      ? Math.ceil(this._app.renderer.width / cellSize) + 2
      : this._grid.numColumns;
    const height = gridRows * cellSize;

    const gridColor = 0xffffff;
    const gridAlpha = 0.5;

    if (this._lineType === 'dots' || this._lineType === 'editor') {
      for (let r = 0; r < gridRows + 1; r++) {
        for (let c = 0; c < gridColumns + 1; c++) {
          this._graphics.beginFill(gridColor, gridAlpha);
          this._graphics.drawRect(
            c * cellSize - cellPadding,
            r * cellSize - cellPadding,
            cellPadding * 2,
            cellPadding * 2
          );
          this._graphics.endFill();
        }
      }
    }
    if (this._lineType === 'inverted') {
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridColumns + 1; c++) {
          this._graphics.beginFill(gridColor, gridAlpha);
          this._graphics.drawRect(
            c * cellSize + cellPadding,
            r * cellSize + cellPadding,
            cellSize - cellPadding * 2,
            cellSize - cellPadding * 2
          );
          this._graphics.endFill();
        }
      }
    }

    if (this._lineType === 'classic' || this._lineType === 'editor') {
      this._graphics.lineStyle(cellPadding, gridColor, gridAlpha);
      for (let r = 0; r < gridRows + 1; r++) {
        this._graphics.moveTo(0, r * cellSize);
        this._graphics.lineTo(gridColumns * cellSize, r * cellSize);
      }

      for (let c = 0; c < gridColumns; c++) {
        this._graphics.moveTo(c * cellSize, 0);
        this._graphics.lineTo(c * cellSize, height);
      }
    }
    this._graphics.cacheAsBitmap = true;
  }

  update(
    worldX: number,
    worldY: number,
    scrollX: boolean,
    scrollY: boolean,
    cellSize: number,
    visibilityX: number,
    visibilityY: number,
    cameraY: number
  ) {
    if (scrollX) {
      this._graphics.x = ((this._camera.x + visibilityX) % cellSize) - cellSize;
    } else {
      throw new Error('Unsupported !scrollX');
    }
    if (scrollY) {
      this._graphics.y = ((cameraY + visibilityY) % cellSize) - cellSize;
    } else {
      this._graphics.y = worldY;
    }
  }
}
