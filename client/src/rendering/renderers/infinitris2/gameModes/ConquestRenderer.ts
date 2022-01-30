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

  onSimulationStep() {
    if (!this._renderer.simulation) {
      return;
    }
    const conquestGameMode = this._renderer.simulation
      .gameMode as ConquestGameMode;

    if (conquestGameMode.isWaitingForNextRound) {
      this._lastGameModeStep = 0;
      return;
    }

    if (++this._lastGameModeStep > 100) {
      this._lastGameModeStep = 0;
      this._renderColumnCaptures(conquestGameMode.columnCaptures);
      this._renderPlayerHealthBars(conquestGameMode.playerHealths);
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
      let lowestFreeCellY = 0;
      for (
        ;
        lowestFreeCellY < this._renderer.simulation.grid.numRows;
        lowestFreeCellY++
      ) {
        if (!this._renderer.simulation.grid.cells[lowestFreeCellY][i].isEmpty) {
          break;
        }
      }
      renderableColumnCapture.container.y =
        (lowestFreeCellY - 1) * this._renderer.cellSize;
    }
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
      renderableColumnCapture.container.y = this._renderer.gridHeight;

      this._renderer._renderCopies(
        renderableColumnCapture,
        1,
        (graphics, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._renderer.gridWidth;
          graphics.x = shadowX;

          graphics.clear();
          const player = columnCaptures[i].playerId
            ? this._renderer.simulation!.getPlayer(columnCaptures[i].playerId!)
            : undefined;
          if (player) {
            graphics.beginFill(player.color);

            if (columnCaptures[i].value < 1) {
              graphics.drawRect(
                this._renderer.cellSize * 0.2,
                this._renderer.cellSize * 0.4,
                this._renderer.cellSize * 0.6 * columnCaptures[i].value,
                this._renderer.cellSize * 0.1
              );
              graphics.beginFill(player.color, 0.3);
              graphics.drawRect(
                this._renderer.cellSize * 0.2,
                this._renderer.cellSize * 0.4,
                this._renderer.cellSize * 0.6,
                this._renderer.cellSize * 0.1
              );
            } else {
              graphics.drawRect(
                this._renderer.cellSize * 0.3,
                this._renderer.cellSize * 0.3,
                this._renderer.cellSize * 0.4,
                this._renderer.cellSize * 0.4
              );
            }
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
