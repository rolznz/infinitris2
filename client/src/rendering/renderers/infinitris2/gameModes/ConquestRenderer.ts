import { ConquestEvent, GameModeEvent } from '@models/GameModeEvent';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import * as PIXI from 'pixi.js-legacy';
import {
  conquestCanPlace,
  ConquestCanPlaceResult,
} from '@core/gameModes/ConquestGameMode';
import { wrap } from '@models/util/wrap';

interface IRenderableFreeCell extends IRenderableEntity<PIXI.Graphics> {}

export class ConquestRenderer implements IGameModeRenderer {
  private _freeRenderableCells!: { [rowColumnId: number]: IRenderableFreeCell };
  private _renderer: BaseRenderer;
  private _cachedCanPlaceResults: { [index: number]: ConquestCanPlaceResult };

  constructor(renderer: BaseRenderer) {
    this._freeRenderableCells = {};
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
    this._cachedCanPlaceResults = {};
  }
  onGameModeEvent(event: ConquestEvent): void {
    if (event.type === 'cellAreaCapture') {
      for (let i = 0; i < 10; i++) {
        this._renderer.emitParticle(
          event.column + 0.5,
          event.row + 0.5,
          event.color,
          'capture'
        );
      }
    }
  }

  onSimulationStep() {
    if (!this._renderer.simulation) {
      return;
    }
    for (const player of this._renderer.simulation.nonSpectatorPlayers) {
      if (player.isFirstBlock && player.block) {
        for (const cell of player.block.cells) {
          if (Math.random() < 0.1) {
            this._renderer.emitParticle(
              cell.column + Math.random(),
              cell.row + Math.random(),
              player.color,
              'capture'
            );
          }
        }
      }
    }
  }

  onSimulationStart() {
    // FIXME: why is a timeout needed to render correctly?
    setTimeout(() => {
      this._rerender();
    }, 1000);
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

  resize() {
    this._cachedCanPlaceResults = {};
    this._rerender();
  }

  private _rerender() {
    const simulation = this._renderer.simulation;
    if (!simulation || !simulation.followingPlayer) {
      return;
    }
    for (let row = 0; row < simulation.grid.numRows; row++) {
      for (let column = 0; column < simulation.grid.numColumns; column++) {
        const cell = simulation.grid.cells[row][column];
        const cellIndex = cell.index;
        if (!this._freeRenderableCells[cellIndex]) {
          const freeCellContainer = new PIXI.Container();
          this._renderer.world.addChild(freeCellContainer);
          this._freeRenderableCells[cellIndex] = {
            container: freeCellContainer,
            children: [],
          };
        }
        const freeRenderableCell = this._freeRenderableCells[cellIndex];

        freeRenderableCell.container.x = this._renderer.getWrappedX(
          column * this._renderer.cellSize
        );
        freeRenderableCell.container.y = cell.row * this._renderer.cellSize;
        const canPlaceResult = conquestCanPlace(
          simulation.followingPlayer!,
          simulation,
          cell,
          false
        );
        const cachedCanPlaceResult = this._cachedCanPlaceResults[cellIndex];
        this._cachedCanPlaceResults[cellIndex] = canPlaceResult;
        if (
          canPlaceResult.canPlace === cachedCanPlaceResult?.canPlace &&
          canPlaceResult.isStalemate === cachedCanPlaceResult?.isStalemate
        ) {
          continue;
        }

        this._renderer.renderCopies(
          freeRenderableCell,
          1,
          (graphics, shadowIndexWithDirection) => {
            const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
            graphics.x = shadowX;

            graphics.clear();

            if (canPlaceResult.canPlace) {
              graphics.beginFill(
                canPlaceResult.isStalemate ? 0xff00ff : 0x00ff00,
                0.5
              );
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
