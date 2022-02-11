import {
  ConquestGameMode,
  IColumnCapture,
} from '@core/gameModes/ConquestGameMode';
import { IPlayer } from '@models/IPlayer';
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
  }

  restart() {
    this.rerender();
  }

  rerender() {
    if (!this._renderer.simulation) {
      return;
    }
    const conquestGameMode = this._renderer.simulation
      .gameMode as ConquestGameMode;

    this._renderColumnCaptures(conquestGameMode.columnCaptures);
    this._renderPlayerHealthBars(conquestGameMode.playerHealths);
  }

  onSimulationStep() {
    if (!this._renderer.simulation) {
      return;
    }
    const conquestGameMode = this._renderer.simulation
      .gameMode as ConquestGameMode;

    if (++this._lastGameModeStep > 100) {
      this._lastGameModeStep = 0;
      this.rerender();
    }
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

      if (
        conquestGameMode.columnCaptures[i].attackerId !== undefined &&
        conquestGameMode.columnCaptures[i].value < 1 &&
        conquestGameMode.columnCaptures[i].value > 0 &&
        Math.random() < 0.05
      ) {
        const attacker = this._renderer.simulation!.getPlayer(
          conquestGameMode.columnCaptures[i].attackerId!
        );
        this._renderer.emitParticle(
          (renderableColumnCapture.container.x +
            this._renderer.cellSize * 0.5) /
            this._renderer.cellSize,
          (renderableColumnCapture.container.y +
            this._renderer.cellSize * 0.5) /
            this._renderer.cellSize,
          attacker.color,
          'capture'
        );
      }
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

      this._renderer._renderCopies(
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
            if (columnCaptures[i].value < 1) {
              graphics.beginFill(player.color);
              graphics.drawCircle(
                this._renderer.cellSize * 0.5,
                this._renderer.cellSize * 0.5,
                this._renderer.cellSize * 0.2
              );
            }

            graphics.beginFill(player.color, columnCaptures[i].value);
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
          /*if (
            columnCaptures[i].attackerId !== undefined &&
            columnCaptures[i].attackerId != columnCaptures[i].playerId
          ) {
            const attacker = this._renderer.simulation!.getPlayer(
              columnCaptures[i].attackerId!
            );
            graphics.endFill();
            graphics.lineStyle(1, attacker.color);
            graphics.drawCircle(
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.5,
              this._renderer.cellSize * 0.3
            );
          }*/
        },
        () => {
          const graphics = new PIXI.Graphics();
          renderableColumnCapture.container.addChild(graphics);
          return graphics;
        }
      );
    }
  }

  private _renderPlayerHealthBars(playerHealths: {
    [playerId: number]: number;
  }) {
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

      const health = playerHealths[player.id] || 1;

      // TODO: move _renderCopies to renderer base class
      this._renderer._renderCopies(
        renderablePlayerHealth,
        1,
        (graphics, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
          graphics.x = shadowX;
          graphics.clear();
          graphics.beginFill(0x000000, 0.1);
          graphics.drawRect(0, 0, healthWidth, healthWidth * 0.2);
          graphics.beginFill(PIXI.utils.rgb2hex([1 - health, health, 0]));
          graphics.drawRect(0, 0, healthWidth * health, healthWidth * 0.2);
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
