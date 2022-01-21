import * as PIXI from 'pixi.js-legacy';
import IGrid from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import Camera from '@src/rendering/Camera';

type GridLineType = 'inverted' | 'classic';

export class GridLines {
  private _grid: IGrid;
  private _graphics: PIXI.Graphics;
  private _camera: Camera;
  private _width: number;
  private _height: number;
  private _app: PIXI.Application;
  private _lineType: GridLineType;

  constructor(
    simulation: ISimulation,
    app: PIXI.Application,
    camera: Camera,
    lineType: GridLineType = 'inverted'
  ) {
    this._app = app;
    this._grid = simulation.grid;
    this._graphics = new PIXI.Graphics();
    this._lineType = lineType;

    app.stage.addChild(this._graphics);
    this._camera = camera;
    this._width = 0;
    this._height = 0;
  }

  get y() {
    return this._graphics.y;
  }

  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }

  render(
    gridWidth: number,
    gridHeight: number,
    cellSize: number,
    cellPadding: number,
    scrollX: boolean,
    scrollY: boolean
  ) {
    this._graphics.cacheAsBitmap = false;
    this._graphics.clear();

    this._width = gridWidth;
    this._height = gridHeight;

    const gridRows = scrollY
      ? Math.ceil(this._app.renderer.height / cellSize) + 2
      : this._grid.numRows;
    const gridColumns = scrollX
      ? Math.ceil(this._app.renderer.width / cellSize) + 2
      : this._grid.numColumns;

    const gridColor = 0x000000;
    const gridAlpha = 0.05; //0.0125;

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
    } else {
      this._graphics.lineStyle(cellPadding, gridColor, gridAlpha);
      for (let r = 0; r < gridRows + 1; r++) {
        this._graphics.moveTo(0, r * cellSize);
        this._graphics.lineTo(gridColumns * cellSize, r * cellSize);
      }

      for (let c = 0; c < gridColumns; c++) {
        this._graphics.moveTo(c * cellSize, 0);
        this._graphics.lineTo(c * cellSize, gridHeight);
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
    clampedCameraY: number
  ) {
    if (scrollX) {
      this._graphics.x =
        ((this._camera.wrappedX + visibilityX) % cellSize) - cellSize;
    } else {
      throw new Error('Unsupported !scrollX');
    }
    if (scrollY) {
      this._graphics.y = ((clampedCameraY + visibilityY) % cellSize) - cellSize;
    } else {
      this._graphics.y = worldY;
    }
  }
}
