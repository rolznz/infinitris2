import * as PIXI from 'pixi.js-legacy';
import { IPlayer } from '@models/IPlayer';
import ControlSettings from '@models/ControlSettings';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import Camera from '@src/rendering/Camera';
import IRenderer, { ParticleType } from '@src/rendering/IRenderer';
import {
  IRenderableEntity,
  IRenderableEntityChild,
} from '@src/rendering/IRenderableEntity';
import { ClientApiConfig } from '@models/IClientApi';

const idealCellSize = 38;
const minVerticalCellCount = 21;
const minHorizontalCellCount = 10; // TODO
const maxCellCount = 32;

export abstract class BaseRenderer implements IRenderer {
  protected _camera: Camera;
  protected _gridWidth: number;
  protected _gridHeight: number;
  protected _hasShadows: boolean;
  protected _shadowCount: number;
  protected _simulation: ISimulation | undefined;
  protected _cellSize: number;
  protected _cellPadding: number;
  protected _app: PIXI.Application;
  protected _world: PIXI.Container;
  protected _appWidth: number;
  protected _appHeight: number;
  protected _visibilityX: number;
  protected _visibilityY: number;
  protected _hasScrollY: boolean;
  protected _hasScrollX: boolean;
  protected _floorHeight: number;
  protected _clampedCameraY: number;
  protected _clientApiConfig: ClientApiConfig;

  constructor(clientApiConfig: ClientApiConfig, backgroundColor?: number) {
    this._clientApiConfig = clientApiConfig;
    this._camera = new Camera();
    this._gridWidth = 0;
    this._gridHeight = 0;
    this._hasShadows = false;
    this._shadowCount = 0;
    this._cellSize = 0;
    this._cellPadding = 0;
    this._app = new PIXI.Application({
      backgroundColor,
      antialias: true,
      // TODO: potentially enable resolution drop for lowest renderer quality
      // before doing this, other things should probably be considered, such as optimizing grid/block/cell renderering, asset sizes, optional layers, etc.
      // also, review the simulation speed, maybe the renderer can skip frames.
      //resolution: 0.5, //rendererQuality === 'low' ? undefined : resolution
    });
    this._world = new PIXI.Container();
    this._world.sortableChildren = true;
    this._appWidth = 0;
    this._appHeight = 0;
    this._visibilityX = 0;
    this._visibilityY = 0;
    this._hasScrollX = false;
    this._hasScrollY = false;
    this._floorHeight = 0;
    this._clampedCameraY = 0;
  }

  get simulation(): ISimulation | undefined {
    return this._simulation;
  }

  get world(): PIXI.Container {
    return this._world;
  }

  get app(): PIXI.Application {
    return this._app;
  }

  get cellSize(): number {
    return this._cellSize;
  }

  get gridWidth(): number {
    return this._gridWidth;
  }

  get gridHeight(): number {
    return this._gridHeight;
  }

  abstract create(): void;
  abstract destroy(): void;
  abstract rerenderGrid(): void;
  onSimulationInit(simulation: ISimulation) {
    this._simulation = simulation;
    this._world.removeChildren();
  }
  abstract onSimulationStep(simulation: ISimulation): void;
  abstract onSimulationNextDay(simulation: ISimulation): void;
  abstract onSimulationNextRound(simulation: ISimulation): void;
  abstract onPlayerCreated(player: IPlayer): void;
  abstract onPlayerDestroyed(player: IPlayer): void;
  abstract onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void;
  abstract onPlayerToggleSpectating(player: IPlayer): void;
  abstract onBlockCreated(block: IBlock): void;
  abstract onBlockCreateFailed(block: IBlock): void;
  abstract onBlockPlaced(block: IBlock): void;
  abstract onBlockMoved(
    block: IBlock,
    dx: number,
    dy: number,
    dr: number
  ): void;
  abstract onBlockDropped(block: IBlock): void;
  abstract onBlockDied(block: IBlock): void;
  abstract onBlockDestroyed(block: IBlock): void;
  abstract onLineCleared(row: number): void;
  abstract onGridCollapsed(grid: IGrid): void;
  abstract onGridReset(grid: IGrid): void;
  abstract onCellBehaviourChanged(
    cell: ICell,
    previousBehaviour: ICellBehaviour
  ): void;

  abstract emitParticle(
    x: number,
    y: number,
    color: number,
    type: ParticleType
  ): void;

  _renderCopies<T>(
    renderableEntity: IRenderableEntity<T>,
    opacity: number,
    renderFunction: (
      pixiObject: T,
      shadowIndexWithDirection: number,
      child: IRenderableEntityChild<T>
    ) => void,
    createObject: () => T,
    shadowIndex: number = 0,
    shadowDirection: number = 0
  ) {
    const shadowIndexWithDirection = shadowIndex * shadowDirection;
    let entry = renderableEntity.children.find(
      (child) => child.shadowIndex === shadowIndexWithDirection
    );
    if (!entry) {
      entry = {
        renderableObject: createObject(),
        shadowIndex: shadowIndexWithDirection,
      };
      renderableEntity.children.push(entry);
    }

    renderFunction(entry.renderableObject, shadowIndexWithDirection, entry);

    if (shadowIndex < this._shadowCount) {
      (shadowDirection === 0 ? [-1, 1] : [shadowDirection]).forEach((i) =>
        this._renderCopies(
          renderableEntity,
          opacity,
          renderFunction,
          createObject,
          shadowIndex + 1,
          i
        )
      );
    }
  }

  wrapObjects() {
    this._world.children.forEach((child) => {
      this.wrapObject(child);
    });
  }

  wrapObject(child: PIXI.DisplayObject) {
    child.x = this.getWrappedX(child.x);
  }

  getWrappedX(x: number): number {
    // TODO: replace while loops with single operation
    const wrapSize = this._gridWidth;
    const minVisibilityX = Math.min(this._visibilityX, this._gridWidth);
    let maxIterations = 1000;
    while (x + this._cellSize < -this._camera.x - minVisibilityX) {
      x += wrapSize;
      if (--maxIterations < 0) {
        throw new Error('FIXME remove while loop in getWrappedX (+)');
      }
    }
    while (x + this._cellSize > -this._camera.x + wrapSize - minVisibilityX) {
      x -= wrapSize;
      if (--maxIterations < 0) {
        throw new Error('FIXME remove while loop in getWrappedX (-)');
      }
    }
    return x;
  }

  tick() {
    if (
      this._app.renderer.width != window.innerWidth ||
      this._app.renderer.height !== window.innerHeight
    ) {
      this._app.renderer.resize(window.innerWidth, window.innerHeight);
      this._app.renderer.view.style.width = window.innerWidth + 'px';
      this._app.renderer.view.style.height = window.innerHeight + 'px';
    }

    // TODO: move stuff like this into a different layer so it isn't duplicated across renderers
    if (
      this._appWidth != this._app.renderer.width ||
      this._appHeight != this._app.renderer.height
    ) {
      this._resize();
    }

    this._camera.update(this._app.ticker.deltaMS / 16.66);

    // clamp the camera to fit within the grid
    this._clampedCameraY = Math.min(
      Math.max(
        this._camera.y,
        -(
          this._gridHeight -
          this._app.renderer.height +
          this._visibilityY +
          this._calculateFloorHeight()
        )
      ),
      0
    );
    if (this._hasScrollX) {
      this._world.x = this._camera.x + this._visibilityX;
    }
    if (this._hasScrollY) {
      this._world.y = this._clampedCameraY + this._visibilityY;
    }
  }

  protected _resize() {
    if (!this._simulation) {
      return;
    }
    this._camera.reset();
    this._appWidth = this._app.renderer.width;
    this._appHeight = this._app.renderer.height;
    this._cellSize = this._calculateCellSize();
    this._cellPadding = this._calculateCellPadding();
    this._visibilityX = this._appWidth * 0.5;
    this._gridWidth = this._simulation.grid.numColumns * this._cellSize;
    this._gridHeight = this._simulation.grid.numRows * this._cellSize;
    this._floorHeight = this._calculateFloorHeight();
    this._hasScrollX = true; // only false if grid < screen width + shadow rendering disabled - for now always enabled
    this._hasShadows = this._gridWidth < this._appWidth;
    this._hasScrollY = this._gridHeight + this._floorHeight > this._appHeight;

    this._shadowCount = this._hasShadows
      ? Math.ceil(this._appWidth / this._gridWidth / 2)
      : 0;

    /*if (!this._scrollX) {
      this._world.x = this._graphics.x = (appWidth - gridWidth) / 2;
    }*/
    if (!this._hasScrollY) {
      this._world.y = this._appHeight - this._gridHeight - this._floorHeight;
    }

    this._visibilityY = this._app.renderer.height * 0.125;
  }

  private _calculateCellSize = () => {
    const minDimension = this._app.renderer.height;
    if (
      minDimension <
      idealCellSize * minVerticalCellCount * window.devicePixelRatio
    ) {
      return Math.floor(minDimension / minVerticalCellCount);
    }
    return Math.max(idealCellSize, Math.ceil(minDimension / maxCellCount));
  };
  private _calculateCellPadding = () => {
    return this._cellSize * 0.05;
  };
  private _calculateFloorHeight = () => {
    return this._cellSize * 2;
  };
}
