import * as PIXI from 'pixi.js-legacy';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
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
import InputAction, {
  CustomizableInputAction,
  InputActionWithData,
} from '@models/InputAction';
import { GameModeEvent } from '@models/GameModeEvent';
import { RendererQuality } from '@models/RendererQuality';
import { ScreenPositionToCell } from '@src/input/Input';
import { wrap } from '@core/utils/wrap';
import { interpolate } from '@core/utils/interpolate';

export type Wrappable = {
  ignoreVisibility: boolean;
};

const idealCellSize = 38;
const minLandscapeCellCount = 18;
const minPortraitCellCount = 14; // TODO
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
  protected _clientApiConfig: ClientApiConfig;
  protected _rendererQuality: RendererQuality | undefined;

  constructor(
    clientApiConfig: ClientApiConfig,
    backgroundColor?: number,
    rendererQuality?: RendererQuality,
    isDemo = false
  ) {
    this._clientApiConfig = clientApiConfig;
    this._camera = new Camera(isDemo);
    this._gridWidth = 0;
    this._gridHeight = 0;
    this._hasShadows = false;
    this._shadowCount = 0;
    this._cellSize = 0;
    this._cellPadding = 0;
    this._rendererQuality = rendererQuality;
    this._app = new PIXI.Application({
      backgroundColor,
      //antialias: true, // +10% GPU usage
      //preserveDrawingBuffer: true,
      //transparent: true, // +5% GPU usage
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
    //this._clampedCameraY = 0;
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

  get camera(): Camera {
    return this._camera;
  }

  abstract create(): void;
  abstract destroy(): void;
  abstract rerenderGrid(): void;
  onSimulationInit(simulation: ISimulation) {
    this._simulation = simulation;
    this._world.removeChildren();
  }

  abstract emitParticle(
    x: number,
    y: number,
    color: number,
    type: ParticleType
  ): void;

  renderCopies<T>(
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
        this.renderCopies(
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
    child.x = this.getWrappedX(
      child.x,
      (child as any as Wrappable).ignoreVisibility
    );
  }

  /**
   * Wraps objects based on the camera position so that the world is seamless
   * This method only works for objects smaller than the grid size. For larger objects, set ignoreVisibility to true on the container.
   * @param x
   * @param ignoreVisibility
   */
  getWrappedX(x: number, ignoreVisibility = false): number {
    // TODO: replace while loops with single operation
    const wrapSize = this._gridWidth;
    const minVisibilityX = ignoreVisibility
      ? this._gridWidth
      : Math.min(this._visibilityX, this._gridWidth);
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
    const rendererSizeDivider =
      !this._rendererQuality || this._rendererQuality === 'high'
        ? 1
        : this._rendererQuality === 'medium'
        ? 2
        : 4;
    const requiredWidth = window.innerWidth / rendererSizeDivider;
    const requiredHeight = window.innerHeight / rendererSizeDivider;
    if (
      this._app.renderer.width != requiredWidth ||
      this._app.renderer.height !== requiredHeight
    ) {
      this._app.renderer.resize(
        Math.floor(requiredWidth),
        Math.floor(requiredHeight)
      );
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

    // figure out the floor beneath the block and clamp the camera
    // otherwise the camera will scroll down unnecessarily
    // TODO: this is not very smooth, it should probably be based on an average of cells around the block
    let unpassableCellHeight = this._gridHeight;
    if (this._simulation?.followingPlayer?.block) {
      let floorHeightBeneathBlock = this._simulation.grid.numRows - 1;
      for (let cell of this._simulation.followingPlayer.block.cells) {
        for (let row = cell.row; row < this._simulation.grid.numRows; row++) {
          if (!this._simulation.grid.cells[row][cell.column].isPassable) {
            floorHeightBeneathBlock = Math.min(floorHeightBeneathBlock, row);
            break;
          }
        }
      }
      unpassableCellHeight =
        Math.min(
          Math.max(
            floorHeightBeneathBlock,
            this._simulation.followingPlayer.block.cells[0].row +
              Math.floor(minPortraitCellCount * 0.25)
          ),
          this._simulation.grid.numRows
        ) * this._cellSize;
      console.log(floorHeightBeneathBlock);
    }

    // clamp the camera to fit within the grid
    this._camera.clampY(
      0,
      -(
        unpassableCellHeight -
        this._app.renderer.height +
        this._visibilityY +
        this._calculateFloorHeight()
      )
    );

    if (this._hasScrollX) {
      this._world.x = this._camera.x + this._visibilityX;
    }
    if (this._hasScrollY) {
      this._world.y = this._camera.y + this._visibilityY;
    }
  }

  onInputAction = (action: InputActionWithData) => {
    if (
      !this._simulation?.followingPlayer ||
      this._simulation?.followingPlayer.status !== PlayerStatus.ingame ||
      this._simulation.isPaused
    ) {
      const speed = 100;
      this._camera.bump(
        action.type == CustomizableInputAction.MoveLeft
          ? speed
          : action.type === CustomizableInputAction.MoveRight
          ? -speed
          : 0,
        action.type == CustomizableInputAction.RotateAnticlockwise
          ? speed
          : action.type === CustomizableInputAction.RotateClockwise
          ? -speed
          : 0
      );
    }
  };

  screenPositionToCell: ScreenPositionToCell = (x, y) => {
    const column = Math.floor(
      wrap(x - this._world.x, this._gridWidth) / this._cellSize
    );
    const row = Math.floor((y - this._world.y) / this._cellSize);
    return this._simulation?.grid.cells[row]?.[column];
  };

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
    this._hasScrollY =
      this._gridHeight /* + this._floorHeight*/ > this._appHeight;

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
    const minDimension = Math.min(
      this._app.renderer.width,
      this._app.renderer.height
    );
    const minCount =
      this._app.renderer.height < this._app.renderer.width
        ? minLandscapeCellCount
        : minPortraitCellCount;

    if (minDimension < idealCellSize * minCount * window.devicePixelRatio) {
      return Math.floor(minDimension / minCount);
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
