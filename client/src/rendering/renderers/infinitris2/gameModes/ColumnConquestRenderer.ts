import {
  ColumnConquestGameMode,
  IColumnCapture,
} from '@core/gameModes/ColumnConquestGameMode';
import { getBorderColor } from '@models/index';
import { ColumnConquestEvent } from '@models/GameModeEvent';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import * as PIXI from 'pixi.js-legacy';

interface IRenderableColumnCapture extends IRenderableEntity<PIXI.Graphics> {
  column: number;
}

export class ColumnConquestRenderer implements IGameModeRenderer {
  private _columnCaptures!: { [columnId: number]: IRenderableColumnCapture };
  private _lastGameModeStep: number;
  private _renderer: BaseRenderer;

  constructor(renderer: BaseRenderer) {
    this._columnCaptures = {};
    this._lastGameModeStep = 0;
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
  }
  onGameModeEvent(event: ColumnConquestEvent): void {
    if (event.type === 'columnChanged') {
      this._rerender(event.column);
      const playerId = (
        this._renderer.simulation!.gameMode as ColumnConquestGameMode
      ).columnCaptures[event.column].playerId;
      if (playerId !== undefined) {
        const player = this._renderer.simulation!.getPlayer(playerId);
        if (player) {
          for (let i = 0; i < 10; i++) {
            this._renderer.emitParticle(
              event.column + 0.5,
              this._getLowestFreeCellY(event.column) - 0.5,
              player.color,
              'capture'
            );
          }
        }
      }
    }
  }

  resize() {
    this._rerender();
  }

  private _rerender(column?: number) {
    if (!this._renderer.simulation) {
      return;
    }
    const conquestGameMode = this._renderer.simulation
      .gameMode as ColumnConquestGameMode;

    this._renderColumnCaptures(conquestGameMode.columnCaptures, column);
  }

  onNextRound() {
    this._rerender();
  }

  onSimulationStep() {
    if (!this._renderer.simulation) {
      return;
    }
    const conquestGameMode = this._renderer.simulation
      .gameMode as ColumnConquestGameMode;

    for (let i = 0; i < conquestGameMode.columnCaptures.length; i++) {
      const renderableColumnCapture = this._columnCaptures[i];
      if (!renderableColumnCapture) {
        continue;
      }

      renderableColumnCapture.container.x = this._renderer.getWrappedX(
        i * this._renderer.cellSize
      );
      renderableColumnCapture.container.y =
        (this._getLowestFreeCellY(i) - 1) * this._renderer.cellSize;
    }
  }
  private _getLowestFreeCellY(column: number) {
    let lowestFreeCellY = 0;
    for (
      ;
      lowestFreeCellY < this._renderer.simulation!.grid.numRows;
      lowestFreeCellY++
    ) {
      if (
        !this._renderer.simulation!.grid.cells[lowestFreeCellY][column].isEmpty
      ) {
        break;
      }
    }
    return lowestFreeCellY;
  }

  private _renderColumnCaptures(
    columnCaptures: IColumnCapture[],
    column?: number
  ) {
    if (!this._renderer.simulation) {
      return;
    }
    for (let i = 0; i < columnCaptures.length; i++) {
      if (column !== undefined && i !== column) {
        continue;
      }
      if (!this._columnCaptures[i]) {
        const captureContainer = new PIXI.Container();
        this._renderer.world.addChild(captureContainer);
        this._columnCaptures[i] = {
          column: i,
          container: captureContainer,
          children: [],
        };
      }
      const renderableColumnCapture = this._columnCaptures[i];

      renderableColumnCapture.container.x = this._renderer.getWrappedX(
        i * this._renderer.cellSize
      );
      renderableColumnCapture.container.y =
        (this._getLowestFreeCellY(i) - 1) * this._renderer.cellSize;

      this._renderer.renderCopies(
        renderableColumnCapture,
        1,
        (graphics, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
          graphics.x = shadowX;

          graphics.clear();
          const player =
            columnCaptures[i].playerId !== undefined
              ? this._renderer.simulation!.getPlayer(
                  columnCaptures[i].playerId!
                )
              : undefined;
          if (player) {
            const borderColor = PIXI.utils.string2hex(
              getBorderColor(PIXI.utils.hex2string(player.color))
            );

            graphics.beginFill(borderColor);
            graphics.drawCircle(
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.3
            );

            graphics.beginFill(player.color);
            graphics.drawCircle(
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.2
            );
          } else {
            graphics.beginFill(0, 0.1);
            graphics.drawCircle(
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.1
            );
          }
        },
        () => {
          const graphics = new PIXI.Graphics();
          renderableColumnCapture.container.addChild(graphics);
          return graphics;
        }
      );
    }
  }
}
