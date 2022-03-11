import {
  ConquestGameMode,
  IColumnCapture,
} from '@core/gameModes/ConquestGameMode';
import { GameModeEvent } from '@models/GameModeEvent';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import IRenderer from '@src/rendering/IRenderer';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import * as PIXI from 'pixi.js-legacy';

interface IRenderableColumnCapture extends IRenderableEntity<PIXI.Graphics> {
  column: number;
}

interface IRenderablePlayerHealthBar extends IRenderableEntity<PIXI.Graphics> {
  playerId: number;
}

export class ConquestRenderer implements IGameModeRenderer {
  private _columnCaptures!: { [cellId: number]: IRenderableColumnCapture };
  private _playerHealthBars!: {
    [playerId: number]: IRenderablePlayerHealthBar;
  };
  private _lastGameModeStep: number;
  private _renderer: BaseRenderer;

  constructor(renderer: BaseRenderer) {
    this._columnCaptures = {};
    this._playerHealthBars = {};
    this._lastGameModeStep = 0;
    this._renderer = renderer;
    this._renderer.simulation!.addEventListener(this);
  }
  onSimulationInit(simulation: ISimulation): void {}
  onPlayerCreated(player: IPlayer): void {}
  onPlayerScoreChanged(player: IPlayer, amount: number): void {}
  onPlayerHealthChanged(player: IPlayer, amount: number): void {}
  onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void {}
  onPlayerToggleSpectating(player: IPlayer): void {}
  onBlockCreated(block: IBlock): void {}
  onBlockCreateFailed(block: IBlock): void {}
  onBlockPlaced(block: IBlock): void {}
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number): void {}
  onBlockDropped(block: IBlock): void {}
  onBlockDied(block: IBlock): void {}
  onBlockDestroyed(block: IBlock): void {
    this.rerender(); // TODO: optimize - only re-render block columns
  }
  onClearLines(row: number[]): void {}
  onLinesCleared() {
    this.rerender();
  }
  onLineClearing(row: number): void {}
  onLineClear(row: number): void {}
  onGridReset(grid: IGrid): void {}
  onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void {}
  onCellIsEmptyChanged(cell: ICell): void {}
  onGameModeEvent(event: GameModeEvent): void {
    if (event.type === 'conquest-columnChanged') {
      const playerId = (this._renderer.simulation!.gameMode as ConquestGameMode)
        .columnCaptures[event.column].playerId;
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

  rerender() {
    if (!this._renderer.simulation) {
      return;
    }
    const conquestGameMode = this._renderer.simulation
      .gameMode as ConquestGameMode;

    this._renderColumnCaptures(conquestGameMode.columnCaptures);
    this._renderPlayerHealthBars();
  }

  onSimulationNextRound() {
    this.rerender();
  }

  onSimulationStep() {
    if (!this._renderer.simulation) {
      return;
    }
    // TODO: optimize player health rendering
    const conquestGameMode = this._renderer.simulation
      .gameMode as ConquestGameMode;

    /*if (++this._lastGameModeStep > 100) {
      this._lastGameModeStep = 0;
      this.rerender();
    }*/
    for (let player of this._renderer.simulation.players) {
      const renderablePlayerHealth = this._playerHealthBars[player.id];
      if (renderablePlayerHealth) {
        if (player.block) {
          renderablePlayerHealth.container.visible = true;
          renderablePlayerHealth.container.x = this._renderer.getWrappedX(
            player.block.centreX * this._renderer.cellSize -
              renderablePlayerHealth.children[0].renderableObject.width * 0.5
          );
          renderablePlayerHealth.container.y =
            (player.block.row - 1) * this._renderer.cellSize;
        } else {
          renderablePlayerHealth.container.visible = false;
        }
      }
    }

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

  onPlayerDestroyed(player: IPlayer) {
    if (this._playerHealthBars[player.id]) {
      this._renderer.world.removeChild(
        this._playerHealthBars[player.id].container
      );
      delete this._playerHealthBars[player.id];
    }
    this.rerender();
  }

  private _renderColumnCaptures(columnCaptures: IColumnCapture[]) {
    if (!this._renderer.simulation) {
      return;
    }
    for (let i = 0; i < columnCaptures.length; i++) {
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
            graphics.beginFill(player.color);
            graphics.drawCircle(
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.2
            );

            graphics.beginFill(player.color, 0.5);
            graphics.drawCircle(
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.3
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

  private _renderPlayerHealthBars() {
    if (!this._renderer.simulation) {
      return;
    }
    //
    for (let player of this._renderer.simulation.players) {
      if (!this._playerHealthBars[player.id]) {
        const healthbarContainer = new PIXI.Container();
        this._renderer.world.addChild(healthbarContainer);
        this._playerHealthBars[player.id] = {
          playerId: player.id,
          container: healthbarContainer,
          children: [],
        };
      }
      const renderablePlayerHealth = this._playerHealthBars[player.id];
      const healthWidth = this._renderer.cellSize * 2;

      this._renderer.renderCopies(
        renderablePlayerHealth,
        1,
        (graphics, shadowIndexWithDirection) => {
          const clampedHealth = Math.min(player.health, 1);
          const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
          graphics.x = shadowX;
          graphics.clear();
          graphics.lineStyle(0);
          if (player.health < 2) {
            graphics.beginFill(
              PIXI.utils.rgb2hex([1 - clampedHealth, clampedHealth, 0])
            );
            graphics.drawRect(
              0,
              0,
              healthWidth * clampedHealth,
              healthWidth * 0.2
            );
          }
          graphics.endFill();
          graphics.lineStyle(healthWidth * 0.04, 0x000000, 0.3);
          graphics.drawRect(0, 0, healthWidth, healthWidth * 0.2);
        },
        () => {
          const graphics = new PIXI.Graphics();
          renderablePlayerHealth.container.addChild(graphics);
          return graphics;
        }
      );
    }
  }
}
