import ISimulation from '@models/ISimulation';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import * as PIXI from 'pixi.js-legacy';

interface IPartialLineCell extends IRenderableEntity<PIXI.Graphics> {}

export class PartialLineClearIndicator {
  private _partialLineCells!: { [cellId: number]: IPartialLineCell };
  private _renderer: BaseRenderer;
  constructor(renderer: BaseRenderer) {
    this._partialLineCells = {};
    this._renderer = renderer;
  }

  setLineClearing(simulation: ISimulation, row: number, columns: number[]) {
    for (let column = 0; column < simulation.grid.numColumns; column++) {
      const isClearing = columns.indexOf(column) >= 0;
      const cell = simulation.grid.cells[row][column];
      const cellIndex = cell.index;
      if (!this._partialLineCells[cellIndex]) {
        if (!isClearing) {
          continue;
        }
        const container = new PIXI.Container();
        container.zIndex = 1000;
        this._renderer.world.addChild(container);
        this._partialLineCells[cellIndex] = {
          container: container,
          children: [],
        };
      }

      const partialLineClearCell = this._partialLineCells[cellIndex];

      partialLineClearCell.container.x = this._renderer.getWrappedX(
        column * this._renderer.cellSize
      );
      partialLineClearCell.container.y = cell.row * this._renderer.cellSize;

      this._renderer.renderCopies(
        partialLineClearCell,
        1,
        (graphics, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
          graphics.x = shadowX;

          graphics.clear();

          if (isClearing) {
            graphics.beginFill(0x00ff00, 0.5);
            graphics.drawRect(
              0,
              0,
              this._renderer.cellSize,
              this._renderer.cellSize
            );
          }
        },
        () => {
          const graphics = new PIXI.Graphics();
          partialLineClearCell.container.addChild(graphics);
          return graphics;
        }
      );
    }
  }
}
