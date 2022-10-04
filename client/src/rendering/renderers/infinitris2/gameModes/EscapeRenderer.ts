import { ConquestEvent, GameModeEvent } from '@models/GameModeEvent';
import { BaseRenderer, Wrappable } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/IGameModeRenderer';
import * as PIXI from 'pixi.js-legacy';
import {
  conquestCanPlace,
  ConquestCanPlaceResult,
} from '@core/gameModes/ConquestGameMode';
import { wrap } from '@models/util/wrap';
import IBlock from '@models/IBlock';
import { debounce } from 'ts-debounce';
import {
  escapeCanPlace,
  EscapeGameMode,
} from '@core/gameModes/EscapeGameMode/EscapeGameMode';
import ICell from '@models/ICell';

interface IRenderableFreeCell extends IRenderableEntity<PIXI.Graphics> {}

export class EscapeRenderer implements IGameModeRenderer {
  private _freeRenderableCells!: { [rowColumnId: number]: IRenderableFreeCell };
  private _renderer: BaseRenderer;
  private _cachedCanPlaceResults: { [index: number]: boolean };
  private _debouncedRerender: () => void;
  private _deathLineGraphics: PIXI.Graphics[];

  constructor(renderer: BaseRenderer) {
    this._freeRenderableCells = {};
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
    this._cachedCanPlaceResults = {};
    this._debouncedRerender = debounce(this._rerender, 100);
    this._deathLineGraphics = [0, 1].map((_) => new PIXI.Graphics());
    this._renderer.app.stage.addChild(...this._deathLineGraphics);
  }

  tick() {
    this._updateDeathLine();
  }
  private _updateDeathLine() {
    if (!this._renderer.simulation) {
      return;
    }
    const gameMode = this._renderer.simulation.gameMode as EscapeGameMode;
    for (let i = 0; i < this._deathLineGraphics.length; i++) {
      this._deathLineGraphics[i].visible =
        !this._renderer.simulation.round!.isWaitingForNextRound;

      this._deathLineGraphics[i].x =
        this._renderer.camera.x +
        this._renderer.visibilityX +
        (i === 0
          ? gameMode.deathLineColumn * this._renderer.cellSize -
            this._deathLineGraphics[i].width
          : gameMode.frontDeathLineColumn * this._renderer.cellSize);
    }
  }

  onCellIsEmptyChanged(cell: ICell) {
    this._debouncedRerender();
    if (cell.isEmpty) {
      for (let i = 0; i < 10; i++) {
        this._renderer.emitParticle(
          cell.column + Math.random(),
          cell.row + Math.random(),
          cell.color,
          'classic'
        );
      }
    }
  }

  onSimulationStart() {
    // FIXME: why is a timeout needed to render correctly?
    setTimeout(() => {
      this._debouncedRerender();
    }, 1000);
  }
  onNextRound() {
    setTimeout(() => {
      this._cachedCanPlaceResults = {};
      this._debouncedRerender();
    }, 1);
  }
  onEndRound() {
    this._debouncedRerender();
  }

  onBlockRemoved() {
    setTimeout(() => {
      this._debouncedRerender();
    }, 1);
  }
  onLinesCleared() {
    setTimeout(() => {
      this._debouncedRerender();
    }, 1);
  }
  onPlayerChangeStatus() {
    this._debouncedRerender();
  }

  resize() {
    this._cachedCanPlaceResults = {};
    this._debouncedRerender();

    for (let i = 0; i < this._deathLineGraphics.length; i++) {
      const graphics = this._deathLineGraphics[i];
      graphics.clear();
      graphics.beginFill(0xff0000, i === 0 ? 0.85 : 1);
      graphics.drawRect(
        0,
        0,
        this._renderer.appWidth,
        this._renderer.appHeight
      );
      if (i === 0) {
        graphics.drawRect(
          this._renderer.cellSize,
          0,
          this._renderer.appWidth - this._renderer.cellSize * 2,
          this._renderer.appHeight
        );
      }
    }
    this._updateDeathLine();
  }

  private _rerender() {
    const simulation = this._renderer.simulation;
    const followingPlayer = simulation?.followingPlayer;

    if (!simulation || !followingPlayer) {
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
        const canPlace = escapeCanPlace(
          followingPlayer,
          simulation,
          cell,
          false
        );
        const cachedCanPlaceResult = this._cachedCanPlaceResults[cellIndex];
        this._cachedCanPlaceResults[cellIndex] = canPlace;
        if (canPlace === cachedCanPlaceResult) {
          continue;
        }

        this._renderer.renderCopies(
          freeRenderableCell,
          1,
          (graphics, shadowIndexWithDirection) => {
            const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
            graphics.x = shadowX;

            graphics.clear();

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