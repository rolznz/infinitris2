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
import IBlock from '@models/IBlock';
import { debounce } from 'ts-debounce';

interface IRenderableFreeCell extends IRenderableEntity<PIXI.Graphics> {}

export class ConquestRenderer implements IGameModeRenderer {
  private _freeRenderableCells!: { [rowColumnId: number]: IRenderableFreeCell };
  private _renderer: BaseRenderer;
  private _cachedCanPlaceResults: { [index: number]: ConquestCanPlaceResult };
  private _minimap: PIXI.Graphics | undefined;
  private _debouncedRerender: () => void;
  private _debouncedRerenderMinimap: () => void;

  constructor(renderer: BaseRenderer) {
    this._freeRenderableCells = {};
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
    this._cachedCanPlaceResults = {};
    this._debouncedRerender = debounce(this._rerender, 100);
    this._debouncedRerenderMinimap = debounce(this._rendererMinimap, 100);
  }
  onGameModeEvent(event: ConquestEvent): void {
    if (event.type === 'cellCaptured') {
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
    const topPlayableRowHeight = this._renderer.simulation.getTowerRow() + 1;
    for (
      let column = 0;
      column < this._renderer.simulation.grid.numColumns;
      column++
    ) {
      const cell =
        this._renderer.simulation.grid.cells[topPlayableRowHeight][column];
      if (cell.player && Math.random() < 0.2) {
        this._renderer.emitParticle(
          cell.column + Math.random(),
          cell.row,
          cell.player.color,
          'fountain'
        );
      }
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
  }
  onBlockMoved(block: IBlock) {
    if (block.player === this._renderer?.simulation?.followingPlayer) {
      // TODO: shouldn't re-render the whole minimap, just the player position indicator
      this._debouncedRerenderMinimap();
    }
  }
  onBlockCreated(block: IBlock) {
    if (block.player === this._renderer?.simulation?.followingPlayer) {
      // TODO: shouldn't re-render the whole minimap, just the player position indicator
      this._debouncedRerenderMinimap();
    }
  }

  private _rerender() {
    const simulation = this._renderer.simulation;
    const followingPlayer = simulation?.followingPlayer;
    if (!simulation || !followingPlayer) {
      return;
    }
    this._rendererMinimap();

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
          followingPlayer,
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
  private _rendererMinimap() {
    const simulation = this._renderer.simulation;
    const followingPlayer = simulation?.followingPlayer;
    if (!simulation || !followingPlayer) {
      return;
    }
    if (!this._minimap) {
      this._minimap = new PIXI.Graphics();
      this._renderer.app.stage.addChild(this._minimap);
      this._minimap.zIndex = 10000;
    }
    const minimapWidth = this._renderer.appWidth * 0.3;
    const minimapCellSize = Math.max(
      minimapWidth / simulation.grid.numColumns,
      1
    );
    this._minimap.x =
      this._renderer.appWidth - this._renderer.floorHeight * 0.5 - minimapWidth;
    this._minimap.y =
      this._renderer.appHeight -
      (this._renderer.floorHeight - minimapCellSize * 2) * 0.5 -
      minimapCellSize;
    this._minimap.clear();
    const lineSize = Math.max(minimapCellSize * 0.1, 1);
    this._minimap.lineStyle(lineSize, 0xffffff);
    this._minimap.drawRect(
      -lineSize,
      -lineSize,
      minimapWidth + lineSize * 2,
      minimapCellSize + lineSize * 2
    );

    if (followingPlayer.block) {
      this._minimap.beginFill(followingPlayer.color, 1);
      this._minimap.drawRect(
        (wrap(followingPlayer.block.column, simulation.grid.numColumns) /
          simulation.grid.numColumns) *
          minimapWidth,
        -minimapCellSize * 2,
        minimapCellSize,
        minimapCellSize
      );
    }
    this._minimap.lineStyle(undefined);

    for (let column = 0; column < simulation.grid.numColumns; column++) {
      for (let row = 0; row < simulation.grid.numRows; row++) {
        const cell = simulation.grid.cells[row][column];
        if (cell.player) {
          this._minimap.beginFill(cell.player.color, 1);
          this._minimap.drawRect(
            (column / simulation.grid.numColumns) * minimapWidth,
            0,
            minimapCellSize,
            minimapCellSize
          );
          break;
        }
      }
    }
  }
}
