import { GameModeEvent } from '@models/GameModeEvent';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import * as PIXI from 'pixi.js-legacy';
import { conquestCanPlace } from '@core/gameModes/ConquestGameMode';
import { wrap } from '@models/util/wrap';

interface IRenderableFreeCell extends IRenderableEntity<PIXI.Graphics> {}

export class ConquestRenderer implements IGameModeRenderer {
  private _freeRenderableCells!: { [rowColumnId: number]: IRenderableFreeCell };
  private _renderer: BaseRenderer;

  constructor(renderer: BaseRenderer) {
    this._freeRenderableCells = {};
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
  }
  onGameModeEvent(event: GameModeEvent): void {}

  private _rerender() {
    if (!this._renderer.simulation) {
      return;
    }

    this._renderFreeCells();
  }

  onNextRound() {
    this._rerender();
  }
  onEndRound() {
    this._rerender();
  }

  onBlockRemoved() {
    this._rerender();
  }
  onLinesCleared() {
    this._rerender();
  }

  // private _getLowestFreeCellRow(column: number) {
  //   let lowestFreeCellY = 0;
  //   for (
  //     ;
  //     lowestFreeCellY < this._renderer.simulation!.grid.numRows;
  //     lowestFreeCellY++
  //   ) {
  //     if (
  //       !this._renderer.simulation!.grid.cells[lowestFreeCellY][column].isEmpty
  //     ) {
  //       break;
  //     }
  //   }
  //   return Math.max(0, lowestFreeCellY - 1);
  // }

  private _renderFreeCells() {
    const simulation = this._renderer.simulation;
    if (!simulation || !simulation.followingPlayer) {
      return;
    }
    for (let row = 0; row < simulation.grid.numRows; row++) {
      for (let column = 0; column < simulation.grid.numColumns; column++) {
        const cellIndex = row * simulation.grid.numColumns + column;
        if (!this._freeRenderableCells[cellIndex]) {
          const freeCellContainer = new PIXI.Container();
          this._renderer.world.addChild(freeCellContainer);
          this._freeRenderableCells[cellIndex] = {
            container: freeCellContainer,
            children: [],
          };
        }
        const freeRenderableCell = this._freeRenderableCells[cellIndex];
        const cell = simulation.grid.cells[row][column];

        freeRenderableCell.container.x = this._renderer.getWrappedX(
          column * this._renderer.cellSize
        );
        freeRenderableCell.container.y = cell.row * this._renderer.cellSize;

        this._renderer.renderCopies(
          freeRenderableCell,
          1,
          (graphics, shadowIndexWithDirection) => {
            const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
            graphics.x = shadowX;

            graphics.clear();
            const canPlace = conquestCanPlace(
              simulation.followingPlayer!,
              simulation,
              cell
            );

            if (canPlace) {
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
            freeRenderableCell.container.addChild(graphics);
            return graphics;
          }
        );
      }
    }
  }
}
