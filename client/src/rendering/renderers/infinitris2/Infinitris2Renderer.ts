import IRenderer from '../../IRenderer';
import * as PIXI from 'pixi.js-legacy';
import Grid from '@core/grid/Grid';
import ISimulationEventListener from '@models/ISimulationEventListener';
import Simulation from '@core/Simulation';
import Camera from '@src/rendering/Camera';
import CellType from '@models/CellType';
import LaserBehaviour from '@core/grid/cell/behaviours/LaserBehaviour';
import InputAction from '@models/InputAction';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { imagesDirectory } from '..';
import LockBehaviour from '@core/grid/cell/behaviours/LockBehaviour';
import ControlSettings from '@models/ControlSettings';
import getUserFriendlyKeyText from '@models/util/getUserFriendlyKeyText';
import InputMethod from '@models/InputMethod';
import ICellBehaviour from '@models/ICellBehaviour';
import { WorldBackground } from './WorldBackground';
import { GridFloor } from './GridFloor';
import { DayIndicator } from './DayIndicator';
import ControllablePlayer from '@src/ControllablePlayer';
import { Scoreboard } from './Scoreboard';
import { SpawnDelayIndicator } from './SpawnDelayIndicator';
import { ScoreChangeIndicator } from './ScoreChangeIndicator';
import IGrid from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import { IPlayer } from '@models/IPlayer';
import { RendererQuality } from '@models/RendererQuality';
import { getBorderColor } from '@models/util/adjustColor';
import { WorldType } from '@models/WorldType';
import { GridLines } from '@src/rendering/renderers/infinitris2/GridLines';
import {
  ConquestGameMode,
  IColumnCapture,
} from '@core/gameModes/ConquestGameMode';

const idealCellSize = 32;
const minCellCount = 23;
const maxCellCount = 32;
const particleDivisions = 4;
const numPatternDivisions = 4;

interface IRenderableBlock {
  block: IBlock;
  cells: IRenderableCell[];
  playerNameText: IRenderableEntity<PIXI.Text>;
  face: IRenderableEntity<PIXI.Sprite>;
}

enum RenderCellType {
  Block,
  Cell,
  PlacementHelper,
}

interface IRenderableEntity<T extends PIXI.DisplayObject> {
  // stores all the graphics objects - main render + all shadows
  container: PIXI.Container;
  children: {
    shadowIndex: number;
    pixiObject: T;
    pattern?: PIXI.Sprite;
  }[];
}

interface IRenderableCell extends IRenderableEntity<PIXI.Graphics> {
  cell: ICell;
  // a cell will be rendered 1 time on wrapped grids, N times for shadow wrapping (grid width < screen width)
}

// FIXME: move to own file
interface IRenderableColumnCapture extends IRenderableEntity<PIXI.Graphics> {
  column: number;
}

interface IParticle extends IRenderableEntity<PIXI.Graphics> {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// TODO: retrieve URLs from players
const patternImageUrl = `${imagesDirectory}/pattern_13.png`;
const faceUrl = `${imagesDirectory}/face_9.png`;
//this._app.loader.add(this._getFloorImageFilename());

export default class Infinitris2Renderer
  implements IRenderer, ISimulationEventListener
{
  // FIXME: restructure to not require definite assignment
  private _gridLines!: GridLines;
  private _placementHelperShadowCells!: IRenderableCell[];
  private _virtualKeyboardGraphics?: PIXI.Graphics;
  private _virtualKeyboardCurrentKeyText!: PIXI.Text;
  private _virtualGestureSprites?: PIXI.Sprite[];

  private _app!: PIXI.Application;
  private _world!: PIXI.Container;

  private _shadowGradientGraphics?: PIXI.Graphics;

  // FIXME: blocks should have their own ids!
  private _blocks!: { [playerId: number]: IRenderableBlock };
  private _cells!: { [cellId: number]: IRenderableCell };
  private _columnCaptures!: { [cellId: number]: IRenderableColumnCapture };

  private _particles!: IParticle[];

  private _simulation!: ISimulation;

  private _camera: Camera;
  private _gridWidth!: number;
  private _gridHeight!: number;
  private _cellSize!: number;
  private _scrollY!: boolean;
  private _scrollX!: boolean;
  private _hasShadows!: boolean;
  private _shadowCount!: number;
  private _virtualKeyboardControls?: ControlSettings;
  private _preferredInputMethod: InputMethod;
  private _teachControls: boolean;
  private _worldBackground!: WorldBackground;
  private _gridFloor!: GridFloor;
  private _patternTextures: PIXI.Texture[] = [];
  private _dayIndicator!: DayIndicator;
  private _spawnDelayIndicator!: SpawnDelayIndicator;
  private _scoreboard!: Scoreboard;
  private _scoreChangeIndicator!: ScoreChangeIndicator;
  private _rendererQuality: RendererQuality | undefined;
  private _worldType: WorldType;
  private _appWidth: number;
  private _appHeight: number;
  private _oldOverflowStyle: string;

  constructor(
    preferredInputMethod: InputMethod = 'keyboard',
    teachControls: boolean = false,
    rendererQuality?: RendererQuality,
    worldType: WorldType = 'grass'
  ) {
    this._preferredInputMethod = preferredInputMethod;
    this._teachControls = teachControls;
    this._camera = new Camera();
    this._rendererQuality = rendererQuality;
    this._worldType = worldType;
    this._appWidth = 0;
    this._appHeight = 0;
    this._oldOverflowStyle = document.body.style.overflow;
    document.body.style.overflow = 'none';
  }

  set virtualKeyboardControls(
    virtualKeyboardControls: ControlSettings | undefined
  ) {
    this._virtualKeyboardControls = virtualKeyboardControls;
  }

  set allowedActions(allowedActions: InputAction[] | undefined) {
    this._renderVirtualKeyboard();
    this._renderVirtualGestures();
  }

  /**
   * @inheritdoc
   */
  async create() {
    console.log('Infinitris 2 Renderer');
    this._app = new PIXI.Application({
      //resizeTo: window,
      antialias: true,
      // TODO: potentially enable resolution drop for lowest renderer quality
      // before doing this, other things should probably be considered, such as optimizing grid/block/cell renderering, asset sizes, optional layers, etc.
      // also, review the simulation speed, maybe the renderer can skip frames.
      //resolution: 0.5, //rendererQuality === 'low' ? undefined : resolution
    });

    this._worldBackground = new WorldBackground(
      this._app,
      this._camera,
      this._worldType,
      this._rendererQuality
    );

    this._dayIndicator = new DayIndicator(this._app);

    this._gridFloor = new GridFloor(this._app, this._worldType);
    this._app.loader.add(patternImageUrl);
    this._app.loader.add(faceUrl);

    this._scoreboard = new Scoreboard(this._app);
    this._spawnDelayIndicator = new SpawnDelayIndicator(this._app);
    this._scoreChangeIndicator = new ScoreChangeIndicator(this._app);

    await new Promise((resolve) => this._app.loader.load(resolve));

    const fullPatternTexture = PIXI.Texture.from(patternImageUrl);
    const patternDivisionSize = fullPatternTexture.width / numPatternDivisions;
    for (let x = 0; x < numPatternDivisions; x++) {
      for (let y = 0; y < numPatternDivisions; y++) {
        this._patternTextures.push(
          new PIXI.Texture(
            fullPatternTexture.baseTexture,
            new PIXI.Rectangle(
              x * patternDivisionSize,
              y * patternDivisionSize,
              patternDivisionSize,
              patternDivisionSize
            )
          )
        );
      }
    }

    this._worldBackground.createImages();
    this._gridFloor.createImages();

    // TODO: extract from here and minimal renderer
    if (this._preferredInputMethod === 'touch' && this._teachControls) {
      const gesturesDirectory = `${imagesDirectory}/gestures`;
      const swipeLeftUrl = `${gesturesDirectory}/swipe-left.png`;
      const swipeRightUrl = `${gesturesDirectory}/swipe-right.png`;
      const swipeUpUrl = `${gesturesDirectory}/swipe-up.png`;
      const swipeDownUrl = `${gesturesDirectory}/swipe-down.png`;
      const tapUrl = `${gesturesDirectory}/tap.png`;
      this._app.loader.add(swipeLeftUrl);
      this._app.loader.add(swipeRightUrl);
      this._app.loader.add(swipeUpUrl);
      this._app.loader.add(swipeDownUrl);
      this._app.loader.add(tapUrl);
      await new Promise((resolve) => this._app.loader.load(resolve));
      const createGestureSprite = (url: string) => {
        const sprite = PIXI.Sprite.from(
          this._app.loader.resources[url].texture
        );
        sprite.anchor.set(0.5);
        sprite.alpha = 0;
        return sprite;
      };
      // one sprite is added for each input action
      this._virtualGestureSprites = [];
      this._virtualGestureSprites.push(createGestureSprite(swipeLeftUrl));
      this._virtualGestureSprites.push(createGestureSprite(swipeRightUrl));
      this._virtualGestureSprites.push(createGestureSprite(swipeDownUrl));
      this._virtualGestureSprites.push(createGestureSprite(tapUrl));
      this._virtualGestureSprites.push(createGestureSprite(tapUrl));
      this._virtualGestureSprites.push(createGestureSprite(swipeUpUrl));
    }

    document.body.appendChild(this._app.view);

    this._app.ticker.add(this._tick);
  }

  private _tick = () => {
    if (!this._simulation) {
      return;
    }

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

    const visibilityX = this._getVisiblityX();
    const visibilityY = this._app.renderer.height * 0.125;

    this._camera.update();

    // clamp the camera to fit within the grid
    const clampedCameraY = Math.min(
      Math.max(
        this._camera.y,
        -(
          this._gridHeight -
          this._app.renderer.height +
          visibilityY +
          this._getFloorHeight()
        )
      ),
      0
    );
    if (this._scrollX) {
      this._world.x = this._camera.x + visibilityX;
    }
    if (this._scrollY) {
      this._world.y = clampedCameraY + visibilityY;
    }

    this._gridLines.update(
      this._world.x,
      this._world.y,
      this._scrollX,
      this._scrollY,
      this._cellSize,
      visibilityX,
      visibilityY,
      clampedCameraY
    );

    if (this._scrollX) {
      this._wrapObjects();

      this._worldBackground.update(
        this._scrollX,
        this._scrollY,
        clampedCameraY
      );

      this._gridFloor.update(
        !this._scrollY
          ? this._gridLines.y + this._gridHeight
          : this._world.y + this._gridHeight
      );

      this._dayIndicator.update(this._simulation.dayProportion);
    }

    Object.values(this._cells).forEach((cell) => {
      if (cell.cell.behaviour.requiresRerender) {
        this._renderCell(cell.cell);
      }
      cell.container.alpha = cell.cell.isEmpty ? cell.cell.behaviour.alpha : 1;
    });
  };

  private _wrapObjects() {
    this._world.children.forEach((child) => {
      this._wrapObject(child);
    });
  }

  private _wrapObject(child: PIXI.DisplayObject) {
    child.x = this._getWrappedX(child.x);
  }

  // TODO: move this function to camera
  private _getWrappedX(x: number): number {
    // TODO: replace while loops with single operation
    const wrapSize = this._gridWidth;
    const visibilityX = Math.min(this._getVisiblityX(), this._gridWidth);
    while (x + this._cellSize < -this._camera.x - visibilityX) {
      x += wrapSize;
    }
    while (x + this._cellSize >= -this._camera.x + wrapSize - visibilityX) {
      x -= wrapSize;
    }
    return x;
  }

  /**
   * @inheritdoc
   */
  destroy() {
    if (this._app) {
      this._app.destroy(true);
    }
    document.body.style.overflow = this._oldOverflowStyle;
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: ISimulation) {
    this._simulation = simulation;
    this._blocks = {};
    this._cells = {};
    this._columnCaptures = {};
    this._app.stage.removeChildren();

    this._worldBackground.addChildren();
    this._gridLines = new GridLines(simulation, this._app, this._camera);

    this._gridFloor.addChildren();

    this._shadowGradientGraphics = new PIXI.Graphics();

    this._world = new PIXI.Container();
    this._world.sortableChildren = true;
    this._app.stage.addChild(this._world);

    this._dayIndicator.addChildren();
    this._spawnDelayIndicator.create();
    this._scoreboard.create();
    this._scoreChangeIndicator.create();
    this._placementHelperShadowCells = [];

    if (
      this._virtualKeyboardControls &&
      this._preferredInputMethod === 'keyboard' &&
      this._teachControls
    ) {
      this._virtualKeyboardGraphics = new PIXI.Graphics();
      this._app.stage.addChild(this._virtualKeyboardGraphics);

      this._virtualKeyboardCurrentKeyText = new PIXI.Text('', {
        font: 'bold italic 60px Arvo',
        fill: '#444444',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 7,
      });
      this._app.stage.addChild(this._virtualKeyboardCurrentKeyText);
    }

    if (this._preferredInputMethod === 'touch' && this._teachControls) {
      this._app.stage.addChild(...this._virtualGestureSprites);
    }
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    const renderableBlock: IRenderableBlock = {
      cells: block.cells.map((cell) => ({
        cell,
        container: new PIXI.Container(),
        children: [],
      })),
      block,
      playerNameText: {
        container: new PIXI.Container(),
        children: [],
      },
      face: {
        container: new PIXI.Container(),
        children: [],
      },
    };
    renderableBlock.face.container.zIndex = 1;
    this._world.addChild(renderableBlock.playerNameText.container);
    this._world.addChild(renderableBlock.face.container);
    this._world.addChild(
      ...renderableBlock.cells.map((cell) => cell.container)
    );

    this._blocks[block.player.id] = renderableBlock;
    this._renderBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockCreateFailed(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {
    //this._moveBlock(block);
    this._renderBlock(block); // requires re-render due to borders changing TODO: should not render blocks this way
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockDropped(block: IBlock) {}

  onBlockDestroyed(block: IBlock): void {
    this._removeBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._renderCells(this._simulation.grid.reducedCells); //TODO: only render block + neighbour cells
    //this._renderCells(block.cells);
  }

  onPlayerCreated(player: IPlayer): void {}
  onPlayerDestroyed(player: IPlayer): void {}
  onPlayerToggleChat(player: IPlayer): void {}

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    if (previousBehaviour.type == CellType.Wafer) {
      this._explodeCell(cell, previousBehaviour.color);
    }
    this._renderCell(cell);
  }

  private _explodeCell(cell: ICell, color?: number) {
    for (let x = 0; x < particleDivisions; x++) {
      for (let y = 0; y < particleDivisions; y++) {
        const particle: IParticle = {
          x: cell.column + x / particleDivisions,
          y: cell.row + y / particleDivisions,
          vx: (Math.random() - 0.5) * 0.1,
          vy: -(Math.random() + 0.5) * 0.2,
          container: new PIXI.Container(),
          children: [],
          maxLife: 100,
          life: 100,
        };
        this._world.addChild(particle.container);
        this._particles.push(particle);
        this._renderParticle(particle, color || cell.color);
      }
    }
  }

  private _removeBlock(block: IBlock) {
    var renderableBlock = this._blocks[block.player.id];
    if (!renderableBlock) {
      return;
    }
    this._world.removeChild(
      ...renderableBlock.cells.map((cell) => cell.container)
    );
    this._world.removeChild(renderableBlock.playerNameText.container);

    // TODO: this is probably not an efficient way to manage the face alpha
    // store the faces as an array and process them in the normal loop
    // also will fix the issue where faces do not move down or get removed after line clear
    const faceFadeTime = 1000;
    const fadeSteps = 30;
    setTimeout(
      () => this._world.removeChild(renderableBlock.face.container),
      faceFadeTime
    );
    for (let i = 0; i < fadeSteps; i++) {
      setTimeout(() => {
        renderableBlock.face.container.alpha -= 1 / fadeSteps;
      }, ((i + 1) * faceFadeTime) / fadeSteps);
    }

    delete this._blocks[block.player.id];
  }

  /**
   * @inheritdoc
   */
  onSimulationStep() {
    const followingPlayer = this._simulation.players.find((player) =>
      this._simulation.isFollowingPlayerId(player.id)
    );
    this._scoreboard.update(this._simulation.players, followingPlayer);
    this._scoreChangeIndicator.update(followingPlayer);
    this._spawnDelayIndicator.update(followingPlayer);

    for (const particle of this._particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.99;
      particle.vy += 0.01;
      particle.container.x = particle.x * this._cellSize;
      particle.container.y = particle.y * this._cellSize;
      particle.container.alpha = particle.life / particle.maxLife;
      if (--particle.life <= 0) {
        this._world.removeChild(particle.container);
      }
    }
    this._particles = this._particles.filter((particle) => particle.life > 0);

    if (this._simulation.settings.gameModeType === 'conquest') {
      this._renderColumnCaptures(
        (this._simulation.gameMode as ConquestGameMode).columnCaptures
      );
    }

    // TODO: animation for where block died
    /*Object.values(this._blocks).forEach((block) => {
      if (!block.block.isAlive) {
        block.cells.forEach((cell) => (cell.graphics.alpha *= 0.99));
        if (this._simulation.isFollowingPlayerId(block.block.playerId)) {
          this._placementHelperShadows.forEach(
            (shadow) => (shadow.alpha *= 0.99)
          );
        }
      }
    });*/
  }

  onSimulationNextDay() {}

  /**
   * @inheritdoc
   */
  onLineCleared(_row: number) {
    // TODO: remove, should only render individual cells on cell state change
    this._renderCells(this._simulation.grid.reducedCells);
  }

  rerenderGrid() {
    this._renderCells(this._simulation.grid.reducedCells);
  }

  /**
   * @inheritdoc
   */
  onGridCollapsed(_grid: IGrid) {
    // TODO: optimize
    this._renderCells(this._simulation.grid.reducedCells);
  }

  private _getCellSize = () => {
    const minDimension = this._app.renderer.height;
    if (minDimension < idealCellSize * minCellCount * window.devicePixelRatio) {
      return Math.floor(minDimension / minCellCount);
    }
    return Math.max(idealCellSize, Math.ceil(minDimension / maxCellCount));
  };
  private _getCellPadding = () => {
    return this._getCellSize() * 0.05;
  };
  private _getFloorHeight = () => {
    return this._getCellSize() * 2;
  };

  private _resize = async () => {
    this._camera.reset();

    this._particles = [];

    this._appWidth = this._app.renderer.width;
    this._appHeight = this._app.renderer.height;
    const cellSize = this._getCellSize();
    const cellPadding = this._getCellPadding();
    this._cellSize = cellSize;

    this._gridFloor.resize(this._getFloorHeight());

    this._renderVirtualKeyboard();
    this._renderVirtualGestures();

    const gridWidth = this._simulation.grid.numColumns * cellSize;
    this._gridWidth = gridWidth;

    const gridHeight = this._simulation.grid.numRows * cellSize;
    this._gridHeight = gridHeight;
    this._scrollX = true; // only false if grid < screen width + shadow rendering disabled - for now always enabled
    this._hasShadows = gridWidth < this._appWidth;
    this._scrollY = gridHeight + this._getFloorHeight() > this._appHeight;

    this._gridLines.render(
      gridWidth,
      gridHeight,
      cellSize,
      cellPadding,
      this._scrollX,
      this._scrollY
    );

    this._shadowCount = this._hasShadows
      ? Math.ceil(this._appWidth / gridWidth / 2)
      : 0;

    this._camera.gridWidth = gridWidth;

    /*if (!this._scrollX) {
      this._world.x = this._graphics.x = (appWidth - gridWidth) / 2;
    }*/
    if (!this._scrollY) {
      this._world.y = this._appHeight - gridHeight - this._getFloorHeight();
    }

    this._renderCells(this._simulation.grid.reducedCells);

    for (const block of Object.values(this._blocks)) {
      this._renderBlock(block.block);
    }

    if (this._shadowGradientGraphics) {
      this._shadowGradientGraphics.cacheAsBitmap = false;
    }
    this._shadowGradientGraphics?.clear();
    if (this._shadowGradientGraphics && this._hasShadows) {
      // thanks to https://gist.github.com/gre/1650294
      const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      for (let x = 0; x < this._appWidth; x++) {
        this._shadowGradientGraphics.lineStyle(
          1,
          0xffffff,
          1 -
            easeInOutQuad(
              Math.abs(this._appWidth * 0.5 - x) / (this._appWidth * 0.5)
            ) *
              (this._shadowCount > 1 ? 1 : 0.5) // TODO: better algorithm for transparency based on grid width / screen width
        );
        this._shadowGradientGraphics.moveTo(x, 0);
        this._shadowGradientGraphics.lineTo(x, this._appHeight);
      }

      // TODO: store these and make sure the old one is removed on resize
      var texture = this._app.renderer.generateTexture(
        this._shadowGradientGraphics,
        PIXI.SCALE_MODES.LINEAR,
        1
      );
      this._world.mask = PIXI.Sprite.from(texture);
      this._shadowGradientGraphics.cacheAsBitmap = true;
    }
  };

  private _renderColumnCaptures(columnCaptures: IColumnCapture[]) {
    for (let i = 0; i < columnCaptures.length; i++) {
      if (!this._columnCaptures[i]) {
        const captureContainer = new PIXI.Container();
        this._world.addChild(captureContainer);
        this._columnCaptures[i] = {
          column: i,
          container: captureContainer,
          children: [],
        };
      }
      const renderableColumnCapture = this._columnCaptures[i];

      renderableColumnCapture.container.x = this._getWrappedX(
        i * this._cellSize
      );
      renderableColumnCapture.container.y = this._gridHeight;

      this._renderCopies(
        renderableColumnCapture,
        1,
        (graphics) => {
          graphics.clear();
          if (columnCaptures[i].player) {
            graphics.beginFill(columnCaptures[i].player!.color);

            if (columnCaptures[i].value < 1) {
              graphics.drawRect(
                this._cellSize * 0.2,
                this._cellSize * 0.4,
                this._cellSize * 0.6 * columnCaptures[i].value,
                this._cellSize * 0.1
              );
            } else {
              graphics.drawRect(
                this._cellSize * 0.3,
                this._cellSize * 0.3,
                this._cellSize * 0.4,
                this._cellSize * 0.4
              );
            }
          }
        },
        () => new PIXI.Graphics(),
        () => undefined
      );
    }
  }

  private _renderCells(cells: ICell[]) {
    cells.forEach((cell) => this._renderCell(cell));
  }

  private _renderCell = (cell: ICell) => {
    const cellIndex = cell.row * this._simulation.grid.numColumns + cell.column;
    if (!this._cells[cellIndex]) {
      const cellContainer = new PIXI.Container();
      this._world.addChild(cellContainer);
      this._cells[cellIndex] = {
        cell,
        container: cellContainer,
        children: [],
      };
    }
    const renderableCell: IRenderableCell = this._cells[cellIndex];

    if (!cell.isEmpty || cell.behaviour.type !== CellType.Normal) {
      const cellSize = this._getCellSize();
      renderableCell.container.x = this._getWrappedX(
        renderableCell.cell.column * cellSize
      );
      renderableCell.container.y = renderableCell.cell.row * cellSize;
      this._renderCellCopies(
        renderableCell,
        RenderCellType.Cell,
        1,
        cell.color
      );
    } else {
      renderableCell.children.forEach((child) => {
        child.pixiObject.clear();
        if (child.pattern) {
          child.pattern.visible = false;
        }
      });
    }
  };

  private _renderBlock(block: IBlock) {
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];
    this._moveBlock(block);

    renderableBlock.cells.forEach((cell) => {
      this._renderCellCopies(cell, RenderCellType.Block, 1, block.player.color);
    });

    this._renderCopies(
      renderableBlock.playerNameText,
      1,
      () => {},
      () => {
        const text = new PIXI.Text(block.player.nickname, {
          font: 'bold italic 60px Arvo',
          fill: PIXI.utils.hex2string(block.player.color),
          align: 'center',
          //stroke: '#000000',
          //strokeThickness: 7,
          dropShadow: true,
          dropShadowAngle: Math.PI / 2,
          dropShadowDistance: 1,
          dropShadowBlur: 2,
        });
        text.anchor.set(0.5, 0);
        return text;
      },
      () => undefined
    );
    this._renderCopies(
      renderableBlock.face,
      1,
      () => {},
      () => {
        const face = PIXI.Sprite.from(faceUrl);
        face.scale.set((this._getCellSize() / face.width) * 2);
        face.anchor.set(0.5, 0.5);
        return face;
      },
      () => undefined
    );

    const followingPlayer = this._simulation.players.find((player) =>
      this._simulation.isFollowingPlayerId(player.id)
    );
    if (followingPlayer && block.player.id === followingPlayer.id) {
      // render block placement shadow on every frame (it's difficult to figure out if lava transitioned to active/inactive, locks changed etc.)
      const cellSize = this._getCellSize();
      const blockX = block.centreX * cellSize;
      const y = block.row * cellSize;
      this._camera.follow(
        blockX, // + block.width * cellSize * 0.5,
        y,
        block.player.id
      );
      this._renderBlockPlacementShadow(block);
    }
  }

  private _getVisiblityX() {
    return this._app.renderer.width * 0.5;
  }

  private _moveBlock(block: IBlock) {
    const cellSize = this._getCellSize();
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];

    for (let i = 0; i < block.cells.length; i++) {
      renderableBlock.cells[i].cell = block.cells[i];
    }

    renderableBlock.cells.forEach((cell) => {
      cell.container.x = cell.cell.column * cellSize;
      cell.container.y = cell.cell.row * cellSize;
    });

    const textCentreX = block.centreX * cellSize;
    const textY = block.row * cellSize - cellSize * 1.2;
    renderableBlock.playerNameText.container.x = textCentreX;
    renderableBlock.playerNameText.container.y = textY;

    const topCells = renderableBlock.cells.filter(
      (cell) =>
        !renderableBlock.cells.some((other) => other.cell.row < cell.cell.row)
    );

    renderableBlock.face.container.x =
      (topCells[0].cell.column + topCells.length / 2) * cellSize;
    renderableBlock.face.container.y = (topCells[0].cell.row + 0.5) * cellSize;
  }

  private _renderParticle(particle: IParticle, color: number) {
    const particleSize = this._getCellSize() / particleDivisions;
    this._renderCopies(
      particle,
      1,
      (graphics) => {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawRect(0, 0, particleSize, particleSize);
      },
      () => new PIXI.Graphics(),
      () => undefined
    );
  }

  private _renderCellCopies(
    renderableCell: IRenderableCell,
    renderCellType: RenderCellType,
    opacity: number,
    color: number,
    isTower?: boolean
  ) {
    this._renderCopies(
      renderableCell,
      opacity,
      (graphics, pattern) => {
        graphics.clear();
        const cellSize = this._getCellSize();
        // TODO: extract rendering of different behaviours
        if (
          renderCellType !== RenderCellType.Cell ||
          (renderableCell.cell.type === CellType.FinishChallenge &&
            renderableCell.cell.isEmpty) ||
          renderableCell.cell.type === CellType.Laser ||
          renderableCell.cell.type === CellType.Infection ||
          renderableCell.cell.type === CellType.Deadly ||
          !renderableCell.cell.isEmpty
        ) {
          // FIXME: use cell colour - cell colour and cell behaviour color don't have to be the same
          // e.g. non-empty red key cell
          //graphics.cacheAsBitmap = true;
          graphics.beginFill(color, Math.min(opacity, 1));
          if (isTower) {
            graphics.drawRect(
              cellSize * 0.1,
              cellSize * 0.1,
              cellSize * 0.8,
              cellSize * 0.8
            );
          } else {
            graphics.drawRect(0, 0, cellSize, cellSize);
          }
          //graphics.
          if (opacity === 1) {
            if (pattern) {
              pattern.visible = true;
              pattern.width = this._getCellSize();
              pattern.height = this._getCellSize();
            }
            const borderSize = this._getCellPadding() * 2;
            const borderColor = PIXI.utils.string2hex(
              getBorderColor(PIXI.utils.hex2string(color))
            );
            graphics.beginFill(borderColor);
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, 1, 0)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(cellSize - borderSize, 0, borderSize, cellSize);
            }
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, -1, 0)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(0, 0, borderSize, cellSize);
            }
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, 0, -1)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(0, 0, cellSize, borderSize);
            }
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, 0, 1)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(0, cellSize - borderSize, cellSize, borderSize);
            }

            // corners
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, -1, -1)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(0, 0, borderSize, borderSize);
            }
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, 1, -1)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(
                cellSize - borderSize,
                0,
                borderSize,
                borderSize
              );
            }
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, -1, 1)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(
                0,
                cellSize - borderSize,
                borderSize,
                borderSize
              );
            }
            if (
              !this._simulation.grid
                .getNeighbour(renderableCell.cell, 1, 1)
                ?.isConnectedTo(renderableCell.cell)
            ) {
              graphics.drawRect(
                cellSize - borderSize,
                cellSize - borderSize,
                borderSize,
                borderSize
              );
            }
          }
        }

        if (renderableCell.cell.isEmpty) {
          switch (renderableCell.cell.type) {
            case CellType.Wafer:
              graphics.beginFill(color, Math.min(opacity, 1));

              graphics.drawRect(
                0,
                (cellSize * 1.5) / 8,
                cellSize,
                (cellSize * 0.5) / 8
              );

              graphics.drawRect(
                0,
                (cellSize * 4) / 8,
                cellSize,
                (cellSize * 0.5) / 8
              );

              graphics.drawRect(
                0,
                (cellSize * 6) / 8,
                cellSize,
                (cellSize * 0.5) / 8
              );

              break;
            case CellType.Key:
              graphics.beginFill(color, Math.min(opacity, 1));

              // bit
              graphics.drawRect(
                (cellSize * 4.5) / 8,
                (cellSize * 1.5) / 8,
                (cellSize * 1) / 8,
                (cellSize * 0.5) / 8
              );

              graphics.drawRect(
                (cellSize * 4.5) / 8,
                (cellSize * 2.5) / 8,
                (cellSize * 1) / 8,
                (cellSize * 0.5) / 8
              );

              // shank
              graphics.drawRect(
                (cellSize * 3.5) / 8,
                (cellSize * 1) / 8,
                (cellSize * 1) / 8,
                (cellSize * 4) / 8
              );

              // bow
              graphics.drawRect(
                (cellSize * 2.5) / 8,
                (cellSize * 5) / 8,
                (cellSize * 3) / 8,
                (cellSize * 2) / 8
              );
              break;
            case CellType.Lock:
              // background
              graphics.beginFill(color, Math.min(opacity, 0.5));
              graphics.drawRect(0, 0, cellSize, cellSize);

              graphics.beginFill(color, Math.min(opacity, 1));
              // shackle - top
              graphics.drawRect(
                (cellSize * 2) / 8,
                cellSize / 8,
                (cellSize * 4) / 8,
                cellSize / 8
              );

              // shackle - sides
              graphics.drawRect(
                (cellSize * 2) / 8,
                cellSize / 8,
                (cellSize * 1) / 8,
                (cellSize * 3) / 8
              );

              graphics.drawRect(
                (cellSize * 5) / 8,
                cellSize / 8,
                (cellSize * 1) / 8,
                (cellSize * 3) / 8
              );

              // body
              graphics.drawRect(
                (cellSize * 1) / 8,
                cellSize * (4 / 8),
                (cellSize * 6) / 8,
                (cellSize * 3) / 8
              );
              break;
          }
        }
      },
      () => new PIXI.Graphics(),
      () => {
        if (opacity < 1) {
          return undefined;
        }
        const patternSprite = PIXI.Sprite.from(
          this._patternTextures[
            (renderableCell.cell.row % numPatternDivisions) +
              numPatternDivisions *
                (renderableCell.cell.column % numPatternDivisions)
          ]
        );
        return patternSprite;
      }
    );
  }

  private _renderCopies<T extends PIXI.DisplayObject>(
    renderableEntity: IRenderableEntity<T>,
    opacity: number,
    renderFunction: (pixiObject: T, pattern?: PIXI.Sprite) => void,
    createPixiObject: () => T,
    createPattern: () => PIXI.Sprite | undefined,
    shadowIndex: number = 0,
    shadowDirection: number = 0
  ) {
    const shadowIndexWithDirection = shadowIndex * shadowDirection;
    let entry = renderableEntity.children.find(
      (child) => child.shadowIndex === shadowIndexWithDirection
    );
    if (!entry) {
      entry = {
        pixiObject: createPixiObject(),
        pattern: createPattern?.(),
        shadowIndex: shadowIndexWithDirection,
      };
      renderableEntity.children.push(entry);
      renderableEntity.container.addChild(entry.pixiObject);
      if (entry.pattern) {
        renderableEntity.container.addChild(entry.pattern);
      }
    }

    const pixiObject = entry.pixiObject;
    const pattern = entry.pattern;

    renderFunction(pixiObject, pattern);

    const shadowX = shadowIndexWithDirection * this._gridWidth;
    pixiObject.x = shadowX;
    if (pattern) {
      pattern.x = shadowX;
    }
    if (shadowIndex < this._shadowCount) {
      (shadowDirection === 0 ? [-1, 1] : [shadowDirection]).forEach((i) =>
        this._renderCopies(
          renderableEntity,
          opacity,
          renderFunction,
          createPixiObject,
          createPattern,
          shadowIndex + 1,
          i
        )
      );
    }
  }

  private _renderBlockPlacementShadow(block: IBlock) {
    const cellSize = this._getCellSize();
    const lowestCells = block.cells.filter(
      (cell) =>
        !block.cells.find(
          (other) => other.column === cell.column && other.row > cell.row
        )
    );

    this._placementHelperShadowCells.forEach((shadow) => {
      shadow.children.forEach((child) => child.pixiObject.clear());
    });

    const lowestBlockRow = block.bottomRow;

    let highestPlacementRow = this._simulation.grid.numRows - 1;

    for (const cell of lowestCells) {
      for (let y = cell.row; y < highestPlacementRow; y++) {
        if (!this._simulation.grid.cells[y + 1][cell.column].isPassable) {
          highestPlacementRow = Math.min(
            y + (lowestBlockRow - cell.row),
            highestPlacementRow
          );
          continue;
        }
      }
    }

    const isTower =
      this._simulation.settings.preventTowers !== false &&
      this._simulation.grid.isTower(highestPlacementRow);

    // render placement helper shadow - this could be done a lot more efficiently by rendering one line per column,
    // but for now it's easier to reuse the cell rendering code (for shadows)
    let cellIndex = 0;
    lowestCells.forEach((cell, index) => {
      const cellDistanceFromLowestRow = lowestBlockRow - cell.row;
      for (
        let y = cell.row + 1;
        y <= highestPlacementRow - cellDistanceFromLowestRow;
        y++
      ) {
        let renderableCell: IRenderableCell;
        if (this._placementHelperShadowCells.length > cellIndex) {
          renderableCell = this._placementHelperShadowCells[cellIndex];
        } else {
          renderableCell = {
            cell,
            children: [],
            container: new PIXI.Container(),
          };
          this._world.addChild(renderableCell.container);
          this._placementHelperShadowCells.push(renderableCell);
        }
        renderableCell.container.x = cell.column * cellSize;
        renderableCell.container.y = y * cellSize;
        renderableCell.container.zIndex = -1000;
        this._renderCellCopies(
          renderableCell,
          RenderCellType.PlacementHelper,
          isTower ? 0.66 : 0.33,
          isTower ? 0xff0000 : block.player.color,
          isTower
        );
        cellIndex++;
      }
    });
  }

  private _renderVirtualKeyboard() {
    if (!this._virtualKeyboardGraphics || !this._virtualKeyboardControls) {
      return;
    }
    this._virtualKeyboardGraphics.clear();
    this._virtualKeyboardCurrentKeyText.text = '';

    if (!this._teachControls) {
      return;
    }

    // TODO: store last landed on action
    /*const key = this._virtualKeyboardControls[this._allowedActions[0]];
    const keySymbol = getUserFriendlyKeyText(key);
    const keyHeight = this._app.renderer.width * 0.05;
    const keyWidth = (1 + (keySymbol.length - 1) * 0.2) * keyHeight;
    const keyPadding = keyHeight * 0.1;

    const x = this._app.renderer.width * 0.6;
    const y = this._app.renderer.height * 0.25 - keyHeight * 2;
    this._virtualKeyboardCurrentKeyText.text = keySymbol;
    this._virtualKeyboardCurrentKeyText.x = x + keyWidth * 0.5;
    this._virtualKeyboardCurrentKeyText.y = y + keyHeight * 0.5;
    this._virtualKeyboardCurrentKeyText.anchor.x = 0.5;
    this._virtualKeyboardCurrentKeyText.anchor.y = 0.5;

    this._virtualKeyboardGraphics.beginFill(0xffffff);
    this._virtualKeyboardGraphics.drawRect(
      x + keyPadding,
      y + keyPadding,
      keyWidth - keyPadding * 2,
      keyHeight - keyPadding * 2
    );*/
  }

  private _renderVirtualGestures() {
    if (!this._virtualGestureSprites) {
      return;
    }
    // TODO: store last landed on action
    /*this._virtualGestureSprites.forEach((sprite, i) => {
      sprite.x =
        this._app.renderer.width *
        (i ===
        Object.values(InputAction).indexOf(InputAction.RotateAnticlockwise)
          ? 0.25
          : i ===
            Object.values(InputAction).indexOf(InputAction.RotateClockwise)
          ? 0.75
          : 0.5);
      sprite.y = this._app.renderer.height * 0.75;
      sprite.alpha =
        this._allowedActions?.length === 1 &&
        Object.values(InputAction).indexOf(this._allowedActions[0]) === i
          ? 1
          : 0;
    });*/
  }
}
