import { ParticleType } from '../../../../../models/src/IRenderer';
import * as PIXI from 'pixi.js-legacy';
import CellType from '@models/CellType';
import InputAction, { InputActionWithData } from '@models/InputAction';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { imagesDirectory } from '..';
import ControlSettings from '@models/ControlSettings';
import { InputMethod } from '@models/InputMethod';
import ICellBehaviour from '@models/ICellBehaviour';
import { WorldBackground } from './WorldBackground';
import { GridFloor } from './GridFloor';
import { FallbackLeaderboard } from './FallbackLeaderboard';
import { SpawnDelayIndicator } from './SpawnDelayIndicator';
//import { ScoreChangeIndicator } from './ScoreChangeIndicator';
import IGrid, { GridLineType, BlockShadowType } from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import { RendererQuality } from '@models/RendererQuality';
import { getBorderColor } from '@models/util/adjustColor';
import { WorldType, WorldVariation } from '@models/WorldType';
import { GridLines } from '@src/rendering/renderers/infinitris2/GridLines';
import { ColumnConquestRenderer } from '@src/rendering/renderers/infinitris2/gameModes/ColumnConquestRenderer';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import { BaseRenderer, Wrappable } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { ClientApiConfig } from '@models/IClientApi';
import { wrap } from '@core/utils/wrap';
import { fontFamily, secondaryFontFamily } from '@models/ui';
import { TowerIndicator } from '@src/rendering/renderers/infinitris2/TowerIndicator';
import { LineClearingIndicator } from '@src/rendering/renderers/infinitris2/LineClearingIndicator';
import { GameModeEvent } from '@models/GameModeEvent';
import {
  getCellBehaviourImageFilename,
  renderCellBehaviour,
} from '@src/rendering/renderers/infinitris2/renderCellBehaviour';
import RockBehaviour, {
  rockFilenames,
} from '@core/grid/cell/behaviours/RockBehaviour';
import { GestureIndicator } from '@src/rendering/renderers/infinitris2/GestureIndicator';
import { checkMistake } from '@core/block/checkMistake';
import { ConquestRenderer } from '@src/rendering/renderers/infinitris2/gameModes/ConquestRenderer';
import Grid, { MAX_COLUMNS } from '@core/grid/Grid';
import { hexToString } from '@models/util/hexToString';
import { GarbageDefenseRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GarbageDefenseRenderer';
import LayoutUtils from '@core/block/layout/LayoutUtils';
import Cell from '@core/grid/cell/Cell';

const healthbarOuterUrl = `${imagesDirectory}/healthbar/healthbar.png`;
const healthbarInnerUrl = `${imagesDirectory}/healthbar/healthbar_inner.png`;
const botIconUrl = `${imagesDirectory}/nickname/bot.png`;
const nicknameVerifiedIconUrl = `${imagesDirectory}/nickname/verified.png`;

const particleDivisions = 4;
const numPatternDivisions = 4;
let averageRenderFps: number = 0;
const MAX_PARTICLES = 500;

export type CellConnection = {
  row: number;
  column: number;
  dx: number;
  dy: number;
};

type CachedRenderableCell = {
  connections: CellConnection[];
  color: number;
  type: CellType;
  patternFilename: string | undefined;
  isEmpty: boolean;
  cacheId: number;
  imageFilename: string | undefined;
};

interface IBlockContainer {
  originalBlock: IBlock;

  block: IRenderableEntity<{
    container: PIXI.Container;
    faceSprite: PIXI.Sprite | undefined;
    cells: RenderableCellObject[];
  }>;
}

interface IPlayerContainer {
  originalPlayer: IPlayer;
  healthbar: IRenderableEntity<{
    outer: PIXI.Sprite;
    inner: PIXI.Sprite;
  }>;
  nicknameText: IRenderableEntity<{
    text: PIXI.Text;
    icon?: PIXI.Sprite;
  }>;
  typingIndicator: IRenderableEntity<{
    text: PIXI.Text;
  }>;
  recentChatMessage: {
    entity: IRenderableEntity<{
      text: PIXI.Text;
    }>;
    lastMessageTime: number;
  };
  container: PIXI.Container;
}

enum RenderCellType {
  Block,
  Cell,
  PlacementHelper,
}

type RenderableCellObject = {
  graphics: PIXI.Graphics;
  patternSprite: PIXI.Sprite | undefined;
  patternSpriteFilename: string | undefined;
};

interface IRenderableCell extends IRenderableEntity<RenderableCellObject> {
  cell: ICell;
}
interface IRenderablePlacementHelperCell
  extends IRenderableEntity<PIXI.Graphics> {
  cell: ICell;
}

interface IParticle extends IRenderableEntity<PIXI.Graphics> {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  goalX?: number;
  goalY?: number;
  isSolid?: boolean;
}

interface IBlockDropEffect extends IRenderableEntity<PIXI.Graphics> {}

// TODO: retrieve URLs from players
//const faceUrl = `${imagesDirectory}/face_9.png`;
//this._app.loader.add(this._getFloorImageFilename());

export default class Infinitris2Renderer extends BaseRenderer {
  // FIXME: restructure to not require definite assignment
  private _gridLines!: GridLines;
  private _placementHelperShadowCells!: IRenderablePlacementHelperCell[];

  private _fpsText!: PIXI.Text;

  private _shadowGradientGraphics?: PIXI.Graphics;

  private _blocks!: { [playerId: number]: IBlockContainer };
  private _cells!: { [cellId: number]: IRenderableCell };
  private _players!: { [playerId: number]: IPlayerContainer };

  private _particles!: IParticle[];
  private _blockDropEffects!: IBlockDropEffect[];

  private _preferredInputMethod: InputMethod;
  private _worldBackground!: WorldBackground;
  private _gridFloor!: GridFloor;
  private _patternTextures: { [filename: string]: PIXI.Texture[] } = {};
  private _fallbackSpawnDelayIndicator: SpawnDelayIndicator | undefined;
  private _fallbackLeaderboard: FallbackLeaderboard | undefined;
  //private _scoreChangeIndicator!: ScoreChangeIndicator;
  private _towerIndicator!: TowerIndicator;
  private _lineClearingIndicator!: LineClearingIndicator;
  private _worldType: WorldType;
  private _worldVariation: WorldVariation;

  private _oldOverflowStyle: string;
  private _displayFrameRate = false;
  private _gameModeRenderer: IGameModeRenderer | undefined;
  private _botIconTexture!: PIXI.Texture;
  private _nicknameVerifiedIconTexture!: PIXI.Texture;
  private _healthbarOuterTexture!: PIXI.Texture;
  private _healthbarInnerTexture!: PIXI.Texture;
  private _useFallbackUI: boolean;
  private _autoQualityAdjust = false;
  private _renderFpsFrames: number[];
  private _isDemo: boolean;
  private _challengeEditorGuide: IRenderableEntity<PIXI.Graphics> | undefined;
  private _gestureIndicator: GestureIndicator;
  private _blockShadowType: BlockShadowType;
  private _showFaces: boolean;
  private _showPatterns: boolean;
  private _showNicknames: boolean;
  private _numPaddingRows: number;
  private _showUI?: boolean;
  private _cachedRenderableCells: { [index: number]: CachedRenderableCell };
  private _cacheId: number;
  private _pendingDestroy: boolean;
  private _hasDestroyed: boolean;
  private _loadChallengeCellTypeImages: boolean;

  constructor(
    clientApiConfig: ClientApiConfig,
    preferredInputMethod: InputMethod = 'keyboard',
    controls: ControlSettings,
    rendererQuality?: RendererQuality,
    worldType: WorldType = 'grass',
    worldVariation: WorldVariation = '0',
    useFallbackUI = false,
    isDemo = false,
    gridLineType?: GridLineType,
    blockShadowType: BlockShadowType = 'full',
    showFaces = true,
    showPatterns = true,
    showNicknames = true,
    showUI = true,
    teachAllControls = false,
    loadChallengeCellTypeImages = false
  ) {
    super(clientApiConfig, undefined, rendererQuality, isDemo);
    this._pendingDestroy = false;
    this._hasDestroyed = false;
    this._preferredInputMethod = preferredInputMethod;
    this._worldType = worldType;
    this._useFallbackUI = useFallbackUI;
    this._worldVariation = worldVariation;
    this._isDemo = isDemo;
    this._gridLineType = gridLineType;
    this._showFaces = showFaces;
    this._showPatterns = showPatterns;
    this._showNicknames = showNicknames;
    this._loadChallengeCellTypeImages = loadChallengeCellTypeImages;
    this._cachedRenderableCells = {};
    this._gestureIndicator = new GestureIndicator(
      this._app,
      this._preferredInputMethod,
      controls,
      teachAllControls
    );

    this._numPaddingRows = 0;
    this._blockShadowType = blockShadowType;
    this._oldOverflowStyle = document.body.style.overflow;

    document.body.style.overflow = 'none';
    this._renderFpsFrames = [];
    this._showUI = showUI;
    this._cacheId = 0;
  }

  /**
   * @inheritdoc
   */
  async create() {
    console.log('Infinitris 2 Renderer');

    // wait for font to load
    document.fonts.load('1em ' + fontFamily);
    while (!document.fonts.check('1em ' + fontFamily)) {
      console.log('Waiting for font');
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    this._worldBackground = new WorldBackground(
      this._app,
      this._camera,
      this._worldType,
      this._worldVariation,
      this._rendererQuality
    );

    this._gridFloor = new GridFloor(
      this,
      this._app,
      this._worldType,
      this._worldVariation
    );
    this._towerIndicator = new TowerIndicator(this._app);
    this._lineClearingIndicator = new LineClearingIndicator(this._app);
    //this._app.loader.add(faceUrl);

    //this._scoreChangeIndicator = new ScoreChangeIndicator(this._app);

    this._app.loader.add(healthbarOuterUrl);
    this._app.loader.add(healthbarInnerUrl);

    this._healthbarOuterTexture = PIXI.Texture.from(healthbarOuterUrl);
    this._healthbarInnerTexture = PIXI.Texture.from(healthbarInnerUrl);
    this._botIconTexture = PIXI.Texture.from(botIconUrl);
    this._nicknameVerifiedIconTexture = PIXI.Texture.from(
      nicknameVerifiedIconUrl
    );
    if (this._loadChallengeCellTypeImages) {
      // TODO: collect all images for each cell type, and loop through all cell types, so that no images need to be loaded after simulation start
      console.log('Loading rock images...');
      const fakeGrid = new Grid(1, 1, false);
      // load all rock images for this world
      rockFilenames.forEach((filename) => {
        const rockBehaviour = new RockBehaviour(
          fakeGrid.reducedCells[0],
          fakeGrid,
          filename
        );
        this._app.loader.add(
          getCellBehaviourImageFilename(
            rockBehaviour,
            this._worldType,
            this._worldVariation,
            this._challengeEditorEnabled
          )
        );
      });
      console.log('done');
    }

    await new Promise((resolve) => this._app.loader.load(resolve));

    this._worldBackground.createImages();
    this._gridFloor.createImages();

    await this._gestureIndicator.loadImages();

    this._app.view.style.visibility = 'hidden';
    document.body.appendChild(this._app.view);
  }

  tick() {
    if (this._pendingDestroy && !this._hasDestroyed) {
      this._destroy();
    }
    if (!this._simulation || this._hasDestroyed) {
      return;
    }

    if (this._isDemo) {
      this._camera.bumpPosition(
        (-this._app.ticker.elapsedMS / 1920) * this._app.renderer.width * 0.01,
        0
      );
    }

    if (
      !this._isDemo &&
      this._rendererQuality !== 'low' &&
      this._autoQualityAdjust
    ) {
      const maxFrames = 1000;
      if (this._renderFpsFrames.length > maxFrames) {
        this._renderFpsFrames.shift();
      }
      this._renderFpsFrames.push(this._app.ticker.FPS);
      if (this._renderFpsFrames.length === maxFrames) {
        const avg =
          this._renderFpsFrames.reduce((a, b) => a + b) /
          this._renderFpsFrames.length;
        if (avg < 45) {
          this._rendererQuality = (
            !this._rendererQuality || this._rendererQuality === 'high'
              ? 'medium'
              : 'low'
          ) as RendererQuality;
          console.log('Automatic quality drop');
          this._renderFpsFrames = [];
        }
      }
    }

    super.tick();

    const followingPlayer = this._simulation?.followingPlayer;
    for (const player of this._simulation.players) {
      this._updatePlayerBlockContainer(player.id);
      const blockContainer = this._blocks[player.id];
      if (blockContainer) {
        const block = blockContainer.originalBlock;

        if (followingPlayer && block.player.id === followingPlayer.id) {
          const cellSize = this._cellSize;
          // to ensure the camera doesn't slightly change each time the player gets a new block of different width,
          // just guess the average width is 3
          const blockX = (block.column + 1.5) * cellSize;
          const y = Math.min(
            block.row * cellSize,
            this._gridHeight +
              this._floorHeight -
              this._appHeight +
              this._visibilityY
          );
          this._camera.follow(
            blockX, // + block.width * cellSize * 0.5,
            y,
            block.player.id
          );
          // render block placement shadow on every frame (it's difficult to figure out if lava transitioned to active/inactive, locks changed etc.)
          this._renderBlockPlacementShadow(block);
        } else if (!followingPlayer) {
          this._towerIndicator.hide();
        }
      }
    }

    this._lineClearingIndicator.update(
      !this._hasScrollY ? this._gridLines.y : this._world.y,
      this._cellSize
    );

    if (this._displayFrameRate) {
      this._fpsText.scale.set(this._cellSize * 0.04);
      this._fpsText.x = this._app.renderer.width / 2;
      this._fpsText.y = 10;
      this._fpsText.anchor.set(0.5, 0);

      averageRenderFps =
        averageRenderFps === 0
          ? this._app.ticker.FPS
          : averageRenderFps * 0.99 + this._app.ticker.FPS * (1 - 0.99);
      this._fpsText.text =
        Math.floor(averageRenderFps) +
        ' rFPS / ' +
        this._simulation.fps +
        ' sFPS';
      this._fpsText.tint = averageRenderFps < 50 ? 0xff0000 : 0xffffff;
    } else {
      this._fpsText.visible = false;
    }

    this._gridLines.update(
      this._world.x,
      this._world.y,
      this._hasScrollX,
      this._hasScrollY,
      this._cellSize,
      this._visibilityX,
      this._visibilityY,
      this._camera.y
    );

    if (this._hasScrollX) {
      this.wrapObjects();

      this._worldBackground.update(
        this._hasScrollX,
        this._hasScrollY,
        this._camera.y +
          Math.max(
            this._gridHeight - this._app.renderer.height + this._visibilityY,
            0
          )
      );

      this._gridFloor.update(
        this._camera.x,
        !this._hasScrollY
          ? this._gridLines.y + this._gridHeight
          : this._world.y + this._gridHeight
      );
    }

    for (const cell of this._simulation.grid.reducedCells) {
      if (this._isOnScreen(cell)) {
        if (cell.requiresRerender) {
          this._renderCell(cell);
          cell.requiresRerender = false;
        }
        const renderableCell = this._getRenderableCell(cell);
        renderableCell.container.alpha = cell.behaviour.alpha;

        // rotate non-player cell sprites around center (requires rotating each individually to support shadow and wrap rendering)
        renderableCell.children.forEach((child) => {
          if (child.renderableObject.patternSprite) {
            const rotation = !cell.player ? cell.behaviour.rotation || 0 : 0;
            child.renderableObject.patternSprite.rotation = rotation;
          }
        });
        // TODO: do not access cell type directly like this
        if (cell.behaviour.type === CellType.Rock) {
          renderableCell.container.y =
            (cell.row + (cell.behaviour as RockBehaviour).offsetY) *
            this._cellSize;
        }
      }
    }
  }
  private _isOnScreen(cell: ICell) {
    if (this._hasShadows) {
      return true;
    }

    // TODO: add vertical checks too
    const wrappedX = this.getWrappedX(cell.column * this._cellSize);
    const invertedCameraX = -this._camera.x;
    const isOnScreen =
      wrappedX > invertedCameraX - this._cellSize - this._visibilityX &&
      wrappedX < invertedCameraX + this._visibilityX;
    //console.log('On screen: ' + isOnScreen);
    return isOnScreen;
  }

  onInputAction = (action: InputActionWithData) => {
    super.onInputAction(action);
    if (this._showUI) {
      this._gestureIndicator.onInputAction(action);
    }
  };

  private _updatePlayerBlockContainer(playerId: number) {
    const player = this._simulation?.getPlayer(playerId);
    if (!player) {
      return;
    }
    const blockContainer = this._blocks[player.id];
    const playerContainer = this._players[player.id];
    if (blockContainer) {
      const moveRate = player.block?.isDropping ? 1 : 0.25;
      const rotateRate = 0.35;
      const block = blockContainer.originalBlock;
      // let firstColumn = block.cells.find(
      //   (cell) => !block.cells.some((other) => other.column < cell.column)
      // )!.column;

      /*blockContainer.container.x +=
          (block.column * this._cellSize - blockContainer.container.x) *
          moveRate;*/
      blockContainer.block.container.x =
        (block.column + (block.layout.length % 2) * 0.5) * this._cellSize;
      blockContainer.block.container.y +=
        ((block.row + block.layout[0].length / 2) * this._cellSize -
          blockContainer.block.container.y) *
        moveRate;
      blockContainer.block.children.forEach((child) => {
        child.renderableObject.container.rotation +=
          (() => {
            let diff = wrap(
              block.rotation * Math.PI * 0.5 -
                child.renderableObject.container.rotation,
              Math.PI * 2
            );
            if (diff > Math.PI) {
              diff -= Math.PI * 2;
            }
            return diff;
          })() * rotateRate;
        if (child.renderableObject.faceSprite) {
          child.renderableObject.faceSprite.rotation =
            -child.renderableObject.container.rotation;
        }
      });

      const textCentreX = this.getWrappedX(block.centreX * this._cellSize);
      const textY = (block.topRow - 1.25) * this._cellSize;
      playerContainer.container.x = textCentreX;
      playerContainer.container.y = textY;

      if (this._simulation!.gameMode.hasHealthbars) {
        for (const child of playerContainer.healthbar.children) {
          child.renderableObject.inner.width =
            child.renderableObject.outer.width * player.health;
          child.renderableObject.inner.texture.frame = new PIXI.Rectangle(
            0,
            0,
            child.renderableObject.inner.texture.baseTexture.width *
              player.health,
            child.renderableObject.inner.texture.baseTexture.height
          );
        }
      }
    }
  }

  /**
   * @inheritdoc
   */
  destroy() {
    this._pendingDestroy = true;
  }
  _destroy() {
    this._hasDestroyed = true;
    if (this._app) {
      this._app.destroy(true);
    }
    document.body.style.overflow = this._oldOverflowStyle;
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: ISimulation) {
    super.onSimulationInit(simulation);
    this._particles = [];
    this._gestureIndicator.reset();
    this._blockDropEffects = [];
    this._blocks = {};
    this._cells = {};
    this._players = {};
    this._app.stage.removeChildren();

    this._worldBackground.addChildren();
    this._gridLines = new GridLines(
      simulation,
      this._app,
      this._camera,
      this._gridLineType
    );

    this._gridFloor.addChildren();

    this._shadowGradientGraphics = new PIXI.Graphics();

    this._app.stage.addChild(this._world);

    this._towerIndicator.create();
    this._lineClearingIndicator.create();

    // TODO: support chat as well
    if (this._useFallbackUI) {
      this._fallbackSpawnDelayIndicator = new SpawnDelayIndicator(this._app);
      this._fallbackSpawnDelayIndicator.create();
      this._fallbackLeaderboard = new FallbackLeaderboard(this._app);
      this._fallbackLeaderboard.create();
    }
    //this._scoreChangeIndicator.create();
    this._placementHelperShadowCells = [];

    if (simulation.settings.gameModeType === 'garbage-defense') {
      this._gameModeRenderer = new GarbageDefenseRenderer(this);
    } else if (simulation.settings.gameModeType === 'column-conquest') {
      this._gameModeRenderer = new ColumnConquestRenderer(this);
    } else if (simulation.settings.gameModeType === 'conquest') {
      this._gameModeRenderer = new ConquestRenderer(this);
    }

    this._fpsText = new PIXI.Text('', {
      font: 'bold italic 60px Arvo',
      fill: '#444444',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 7,
    });
    this._app.stage.addChild(this._fpsText);

    this._gestureIndicator.addChildren();

    if (this._challengeEditorEnabled) {
      this._challengeEditorGuide = {
        container: new PIXI.Container(),
        children: [],
      };
      (
        this._challengeEditorGuide.container as any as Wrappable
      ).ignoreVisibility = true;
      this._challengeEditorGuide.container.zIndex = 10000;
      this._world.addChild(this._challengeEditorGuide.container);
    }
    this._resize();
  }

  onGridResize() {
    // FIXME: this is broken. For now just recreating the simulation and grid
    /*for (var renderableCell of Object.values(this._cells)) {
      this._world.removeChild(renderableCell.container);
    }
    this._cells = {};
    this._resize();*/
    this._resize();
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    this._createBlock(block);
    const playerContainer = this._players[block.player.id];
    if (playerContainer) {
      playerContainer.container.visible = true;
    }
  }
  private _createBlock(block: IBlock) {
    this._removeBlock(block, false);
    const blockContainer: IBlockContainer = {
      originalBlock: block,
      block: {
        container: new PIXI.Container(),
        children: [],
      },
    };

    this._world.addChild(blockContainer.block.container);

    this._blocks[block.player.id] = blockContainer;
    this._renderBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockCreateFailed(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    if (block.player === this._simulation?.followingPlayer) {
      const strength = this._cellSize * 0.125;
      this._camera.bumpPosition(
        (Math.random() > 0.5 ? 1 : -1) * strength,
        strength
      ); // minor camera shake
    }

    const numSegments = 4;
    block.cells.forEach((cell) => {
      for (let x = 0; x < numSegments; x++) {
        for (let y = 0; y < numSegments; y++) {
          this.emitParticle(
            cell.column + x / numSegments,
            cell.row + y / numSegments,
            block.player.color,
            'classic'
          );
        }
      }
    });
  }

  /**
   * @inheritdoc
   */
  onBlockDropped(block: IBlock) {
    if (!this._simulation) {
      return;
    }

    if (!this._simulation.settings.instantDrops || this._simulation.isPaused) {
      return;
    }

    const cellSize = this._cellSize;
    const highestCells = block.cells.filter(
      (cell) =>
        !block.cells.find(
          (other) =>
            other.column === cell.column &&
            (!reverseEffect ? other.row < cell.row : other.row > cell.row)
        )
    );

    const dropEffect: IBlockDropEffect = {
      container: new PIXI.Container(),
      children: [],
    };

    const reverseEffect = this._isDemo; // FIXME: make this an optional setting

    this.renderCopies(
      dropEffect,
      1,
      (graphics, shadowIndexWithDirection) => {
        const shadowX = shadowIndexWithDirection * this._gridWidth;
        graphics.x = shadowX;
      },
      () => {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(block.player.color);
        const wrappedBlockColumn = wrap(
          block.column,
          this._simulation!.grid.numColumns
        );
        highestCells.forEach((cell) => {
          let wrappedCellColumn = cell.column;
          if (
            Math.abs(wrappedCellColumn - wrappedBlockColumn) >
            this._simulation!.grid.numColumns / 2
          ) {
            if (wrappedCellColumn < wrappedBlockColumn) {
              wrappedCellColumn += this._simulation!.grid.numColumns;
            } else {
              wrappedCellColumn -= this._simulation!.grid.numColumns;
            }
          }
          let index = 0;
          for (
            let y = cell.row;
            !reverseEffect
              ? y < this._simulation!.grid.numRows
              : y > -this._simulation!.grid.numRows;
            !reverseEffect ? y++ : y--
          ) {
            index++;
            if (
              !reverseEffect &&
              !this._simulation?.grid.cells[y][cell.column].isPassable
            ) {
              break;
            }
            graphics.drawRect(
              (wrappedCellColumn - wrappedBlockColumn) * cellSize,
              (y - block.row) * cellSize,
              cellSize,
              cellSize
            );
          }
        });
        dropEffect.container.addChild(graphics);
        return graphics;
      }
    );
    dropEffect.container.zIndex = -100;
    dropEffect.container.x = this.getWrappedX(block.column * this._cellSize);
    dropEffect.container.y = block.row * this._cellSize;
    dropEffect.container.alpha = 0.5;
    this._world.addChild(dropEffect.container);
    this._blockDropEffects.push(dropEffect);
  }

  onBlockDestroyed(block: IBlock): void {
    this._removeBlock(block);
    if (block.player === this._simulation?.followingPlayer) {
      this._placementHelperShadowCells.forEach((shadow) => {
        shadow.children.forEach((child) => child.renderableObject.clear());
      });
    }
    const playerContainer = this._players[block.player.id];
    if (playerContainer) {
      playerContainer.container.visible = false;
    }
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    if (!this._simulation) {
      return;
    }
    this._updatePlayerBlockContainer(block.player.id);
    if (block.player === this._simulation.followingPlayer && block.isDropping) {
      this._camera.bumpPosition(0, this._cellSize * 0.125 * 0.5); // minor camera shake
    }
  }

  onPlayerCreated(player: IPlayer): void {
    if (player.status === PlayerStatus.spectating) {
      return;
    }
    const playerContainer: IPlayerContainer = {
      originalPlayer: player,
      nicknameText: {
        container: new PIXI.Container(),
        children: [],
      },
      typingIndicator: {
        container: new PIXI.Container(),
        children: [],
      },
      recentChatMessage: {
        entity: {
          container: new PIXI.Container(),
          children: [],
        },
        lastMessageTime: 0,
      },
      healthbar: {
        container: new PIXI.Container(),
        children: [],
      },
      container: new PIXI.Container(),
    };
    playerContainer.container.visible = false;
    playerContainer.container.zIndex = 100;
    playerContainer.container.addChild(playerContainer.nicknameText.container);
    playerContainer.container.addChild(playerContainer.healthbar.container);
    playerContainer.container.addChild(
      playerContainer.recentChatMessage.entity.container
    );
    playerContainer.container.addChild(
      playerContainer.typingIndicator.container
    );
    this._world.addChild(playerContainer.container);

    this._players[player.id] = playerContainer;
    this._renderPlayer(player);

    if (player.characterId && this._showFaces) {
      const faceUrl = this._getFaceUrl(player.characterId);
      if (!this._app.loader.resources[faceUrl]) {
        this._app.loader.add(faceUrl, () => {
          if (player.block) {
            this._renderBlock(player.block);
          }
        });
      }
    }
    if (player.patternFilename && this._showPatterns) {
      const patternImageUrl = this._getPatternUrl(player.patternFilename);
      if (!this._app.loader.resources[patternImageUrl]) {
        this._app.loader.add(patternImageUrl, () => {
          const fullPatternTexture = PIXI.Texture.from(patternImageUrl);
          const patternDivisionSize =
            fullPatternTexture.width / numPatternDivisions;
          this._patternTextures[player.patternFilename!] = [];
          for (let x = 0; x < numPatternDivisions; x++) {
            for (let y = 0; y < numPatternDivisions; y++) {
              this._patternTextures[player.patternFilename!].push(
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
          if (this._simulation) {
            for (const playerWithPattern of this._simulation.players.filter(
              (otherPlayer) =>
                otherPlayer.patternFilename === player.patternFilename
            )) {
              if (playerWithPattern.block) {
                this._renderBlock(playerWithPattern.block);
              }
            }

            const cellsToRerender = this._simulation.grid.reducedCells.filter(
              (cell) => cell.player?.patternFilename === player.patternFilename
            );
            for (const cell of cellsToRerender) {
              delete this._cachedRenderableCells[cell.index];
            }
            this._renderCells(cellsToRerender);
          }
        });
      }
    }
  }

  _renderPlayer(player: IPlayer) {
    if (!this._cellSize) {
      return;
    }
    const playerContainer = this._players[player.id];
    if (!playerContainer) {
      return;
    }
    if (!this._isDemo && this._showNicknames) {
      this.renderCopies(
        playerContainer.nicknameText,
        1,
        (renderableObject, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._gridWidth;
          renderableObject.text.x = shadowX;
          if (renderableObject.icon) {
            renderableObject.icon.x =
              shadowX +
              Math.pow(renderableObject.text.text.length, 1.15) *
                this._cellSize *
                0.1 +
              this._cellSize * 0.75;
          }
        },
        () => {
          const text = new PIXI.Text(player.nickname, {
            align: 'center',
            //stroke: '#000000',
            //strokeThickness: 7,
            fontFamily,
            //fontSize: ,
            dropShadow: true,
            dropShadowAngle: Math.PI / 2,
            dropShadowDistance: 1,
            dropShadowBlur: 2,
            dropShadowColor: hexToString(
              this._worldBackground.blockOutlineColor
            ),
          });

          //text.cacheAsBitmap = true;
          text.anchor.set(0.5, 0.5);
          playerContainer.nicknameText.container.addChild(text);
          let icon: PIXI.Sprite | undefined;

          if (player.isBot) {
            icon = PIXI.Sprite.from(this._botIconTexture);
          } else if (player.isNicknameVerified) {
            icon = PIXI.Sprite.from(this._nicknameVerifiedIconTexture);
          }
          if (icon) {
            icon.anchor.set(0, 0.5);
            playerContainer.nicknameText.container.addChild(icon);
          }
          return { text, icon };
        }
      );
      playerContainer.nicknameText.children.forEach((child) => {
        child.renderableObject.text.style.fill = PIXI.utils.hex2string(
          player.color
        );
        child.renderableObject.text.scale.set(this._cellSize * 0.03);
        child.renderableObject.icon?.scale.set(this._cellSize * 0.03);
      });

      this.renderCopies(
        playerContainer.typingIndicator,
        1,
        (renderableObject, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._gridWidth;
          renderableObject.text.x = shadowX;
        },
        () => {
          const text = new PIXI.Text('...', {
            align: 'center',
            //stroke: '#000000',
            //strokeThickness: 7,
            fontFamily,
            //fontSize: ,
            dropShadow: true,
            dropShadowAngle: Math.PI / 2,
            dropShadowDistance: 1,
            dropShadowBlur: 2,
            dropShadowColor: hexToString(
              this._worldBackground.blockOutlineColor
            ),
          });

          //text.cacheAsBitmap = true;
          text.anchor.set(0.5, 0.15);
          playerContainer.typingIndicator.container.addChild(text);

          return { text };
        }
      );

      playerContainer.typingIndicator.children.forEach((child) => {
        child.renderableObject.text.style.fill = PIXI.utils.hex2string(
          player.color
        );
        child.renderableObject.text.scale.set(this._cellSize * 0.03);
      });
      playerContainer.typingIndicator.container.visible = false;
    }
    this.renderCopies(
      playerContainer.recentChatMessage.entity,
      1,
      (renderableObject, shadowIndexWithDirection) => {
        const shadowX = shadowIndexWithDirection * this._gridWidth;
        renderableObject.text.x = shadowX;
      },
      () => {
        const text = new PIXI.Text('', {
          align: 'center',
          //stroke: '#000000',
          //strokeThickness: 7,
          fontFamily: secondaryFontFamily,
          //fontSize: ,
          dropShadow: true,
          dropShadowAngle: Math.PI / 2,
          dropShadowDistance: 1,
          dropShadowBlur: 2,
          dropShadowColor: hexToString(this._worldBackground.blockOutlineColor),
        });

        //text.cacheAsBitmap = true;
        text.anchor.set(0.5, 0.5);
        playerContainer.recentChatMessage.entity.container.addChild(text);

        return { text };
      }
    );

    playerContainer.recentChatMessage.entity.children.forEach((child) => {
      child.renderableObject.text.style.fill = PIXI.utils.hex2string(
        player.color
      );
      child.renderableObject.text.scale.set(this._cellSize * 0.02);
    });
    playerContainer.recentChatMessage.entity.container.visible = false;

    if (this._simulation!.gameMode.hasHealthbars) {
      this.renderCopies(
        playerContainer.healthbar,
        1,
        (pixiObject, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._gridWidth;

          pixiObject.outer.scale.set(
            (this._cellSize / pixiObject.outer.texture.width) * 2
          );
          pixiObject.inner.tint = player.color;
          /*pixiObject.inner.tileScale.set(
            (this._cellSize / pixiObject.outer.texture.width) * 2
          );*/
          pixiObject.inner.width = pixiObject.outer.width;
          pixiObject.inner.height = pixiObject.outer.height; // - 1; //fix rounding issue

          for (const image of [pixiObject.outer, pixiObject.inner]) {
            image.x = shadowX - pixiObject.outer.width * 0.5;
            image.anchor.set(0, -1);
          }
        },
        () => {
          const outer = PIXI.Sprite.from(this._healthbarOuterTexture);
          // in order to change the frame of the inner sprite's texture, we need a separate texture per player :/
          // consider using a spritesheet as an optimization
          const croppableInnerTexture = new PIXI.Texture(
            this._healthbarInnerTexture.baseTexture,
            this._healthbarInnerTexture.frame
          );
          const inner = PIXI.Sprite.from(croppableInnerTexture);
          playerContainer.healthbar.container.addChild(inner, outer);

          return { outer, inner };
        }
      );
    }
  }

  onPlayerDestroyed(player: IPlayer): void {
    const playerContainer = this._players[player.id];
    if (!playerContainer) {
      return;
    }
    this._world.removeChild(playerContainer.container);
    delete this._players[player.id];
  }

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    // TODO: previousBehaviour.shouldExplode
    if (previousBehaviour.shouldExplode?.()) {
      this._explodeCell(cell, previousBehaviour.color);
    }
    this._markCellAndNeighboursForRerender(cell);
  }

  onCellIsEmptyChanged(cell: ICell) {
    this._markCellAndNeighboursForRerender(cell);
  }

  onPlayerHealthChanged(player: IPlayer, amount: number): void {}
  onPlayerScoreChanged(player: IPlayer, amount: number): void {}
  onGameModeEvent(event: GameModeEvent): void {}

  private _markCellAndNeighboursForRerender(cell: ICell) {
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const neighbour =
          this._simulation!.grid.cells[cell.row + r]?.[
            wrap(cell.column + c, this._simulation!.grid.numColumns)
          ];
        if (neighbour) {
          neighbour.requiresRerender = true;
        }
      }
    }
  }

  private _explodeCell(cell: ICell, color?: number) {
    for (let x = 0; x < particleDivisions; x++) {
      for (let y = 0; y < particleDivisions; y++) {
        this.emitParticle(
          cell.column + x / particleDivisions,
          cell.row + y / particleDivisions,
          color || cell.color,
          'classic'
        );
      }
    }
  }

  emitParticle(
    x: number,
    y: number,
    color: number,
    type: ParticleType,
    isSolid = type !== 'fountain'
  ) {
    if (this._particles.length > MAX_PARTICLES) {
      return;
    }
    const life = type === 'fountain' ? 25 : 50; //type === 'classic' ? 100 : 50;
    const particle: IParticle = {
      x: x + (type === 'capture' ? (Math.random() - 0.5) * 6 : 0),
      y: y + (type === 'capture' ? (Math.random() - 0.5) * 6 : 0),
      vx: type === 'classic' ? (Math.random() - 0.5) * 0.1 : 0,
      vy:
        type === 'fountain'
          ? -(Math.random() + 1) * 0.1
          : type === 'classic'
          ? isSolid
            ? -(Math.random() + 0.5) * 0.05
            : -(Math.random() + 0.5) * 0.1
          : 0,
      container: new PIXI.Container(),
      children: [],
      maxLife: life,
      life,
      type,
      isSolid,
      goalX: x,
      goalY: y,
    };
    particle.container.alpha = 0;
    this._world.addChild(particle.container);
    this._particles.push(particle);
    this._renderParticle(particle, color);
  }

  private _removeBlock(block: IBlock, leaveFace = true) {
    var blockContainer = this._blocks[block.player.id];
    if (!blockContainer) {
      return;
    }
    delete this._blocks[block.player.id];

    if (leaveFace) {
      // remove everything except the face
      blockContainer.block.children.forEach((child) => {
        child.renderableObject.container.removeChild(
          ...child.renderableObject.container.children.filter(
            (c) => c !== child.renderableObject.faceSprite
          )
        );
      });

      // TODO: this is probably not an efficient way to manage the face alpha
      // store the faces as an array and process them in the normal loop
      // also will fix the issue where faces do not move down or get removed after line clear
      const faceFadeTime = 1000;
      const fadeSteps = 30;
      setTimeout(
        () => this._world.removeChild(blockContainer.block.container),
        faceFadeTime
      );
      for (let i = 0; i < fadeSteps; i++) {
        setTimeout(() => {
          blockContainer.block.container.alpha -= 1 / fadeSteps;
        }, ((i + 1) * faceFadeTime) / fadeSteps);
      }
    } else {
      // remove the entire block
      this._world.removeChild(blockContainer.block.container);
    }
  }

  onSimulationMessage(
    _simulation: ISimulation,
    message: string,
    player: IPlayer | undefined
  ) {
    if (player) {
      const playerContainer = this._players[player.id];
      if (playerContainer) {
        playerContainer.recentChatMessage.entity.children.forEach((child) => {
          child.renderableObject.text.text = message;
        });
        playerContainer.recentChatMessage.entity.container.visible = true;
        playerContainer.recentChatMessage.lastMessageTime = Date.now();
        // push name up to fit recent chat message below it
        playerContainer.nicknameText.container.y = -this.cellSize * 0.75;
      }
    }
  }

  /**
   * @inheritdoc
   */
  onSimulationStep() {
    if (!this._simulation) {
      return;
    }
    if (this._showUI) {
      this._gestureIndicator.update(
        this._simulation.followingPlayer?.block,
        this._simulation.isRunning
      );
    }
    for (const player of this._simulation.activePlayers) {
      if (player.requiresFullRerender) {
        this._renderPlayer(player);
        player.requiresFullRerender = false;
      }
    }

    const followingPlayer = this._simulation.followingPlayer;
    this._fallbackLeaderboard?.update(
      this._simulation.players,
      followingPlayer,
      this._simulation,
      this._cellSize * 0.03
    );
    //this._scoreChangeIndicator.update(followingPlayer);
    this._fallbackSpawnDelayIndicator?.update(
      this._simulation,
      followingPlayer
    );

    //console.log('Rendering', this._particles.length, 'particles');
    for (const particle of this._particles) {
      if (particle.type === 'classic' || particle.type === 'fountain') {
        particle.vx *= 0.99;
        particle.vy += 0.01;
        particle.container.alpha = particle.life / particle.maxLife;
        if (particle.isSolid) {
          if (
            (particle.vy > 0 &&
              particle.y + particle.vy > this._simulation.grid.numRows) ||
            this._simulation.grid.cells[Math.floor(particle.y + particle.vy)]?.[
              wrap(
                Math.floor(particle.x + particle.vx),
                this._simulation.grid.numColumns
              )
            ]?.isPassable === false
          ) {
            particle.vy *= -0.3;
            particle.vx *= 0.9;
          }
          if (
            this._simulation.grid.cells[Math.floor(particle.y + particle.vy)]?.[
              wrap(
                Math.floor(particle.x + particle.vx),
                this._simulation.grid.numColumns
              )
            ]?.isPassable === false &&
            this._simulation.grid.cells[Math.floor(particle.y + particle.vy)]?.[
              wrap(Math.floor(particle.x), this._simulation.grid.numColumns)
            ]?.isPassable
          ) {
            particle.vx *= -0.7;
          }
        }
      } else {
        particle.vx = (particle.goalX! - particle.x) * 0.1;
        particle.vy = (particle.goalY! - particle.y) * 0.1;
        particle.container.alpha = 1 - particle.life / particle.maxLife;
      }
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.container.x = this.getWrappedX(particle.x * this._cellSize);
      particle.container.y = particle.y * this._cellSize;
      if (--particle.life <= 0) {
        this._world.removeChild(particle.container);
      }
    }
    this._particles = this._particles.filter((particle) => particle.life > 0);

    for (const dropEffect of this._blockDropEffects) {
      dropEffect.container.alpha -= 0.01; //0.025;
      if (dropEffect.container.alpha <= 0) {
        this._world.removeChild(dropEffect.container);
      }
    }
    this._blockDropEffects = this._blockDropEffects.filter(
      (dropEffect) => dropEffect.container.alpha > 0
    );

    for (const player of this._simulation.players) {
      const playerContainer = this._players[player.id];
      if (!playerContainer) {
        continue;
      }
      playerContainer.typingIndicator.container.visible = player.isChatting;
      if (player.isChatting) {
        playerContainer.typingIndicator.children.forEach((child) => {
          child.renderableObject.text.text = '.'.repeat(
            1 + ((Date.now() / 500) % 3)
          );
        });
      }
      if (
        playerContainer.recentChatMessage.entity.container.visible &&
        Date.now() - playerContainer.recentChatMessage.lastMessageTime > 5000
      ) {
        playerContainer.recentChatMessage.entity.container.visible = false;
        playerContainer.nicknameText.container.y = 0;
      }
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

  onNextRound() {
    this.rerenderGrid();
  }

  onLineClearing(row: number) {
    this._lineClearingIndicator.setLineClearing(row, true);
  }
  onClearLines(rows: number[]) {
    if (!this._simulation) {
      return;
    }
    const numSegments = 2;
    for (const row of rows) {
      this._lineClearingIndicator.setLineClearing(row, false);
      for (const cell of this._simulation.grid.cells[row]) {
        for (let x = 0; x < numSegments; x++) {
          for (let y = 0; y < numSegments; y++) {
            this.emitParticle(
              cell.column + x / numSegments,
              cell.row + y / numSegments,
              cell.color,
              'classic',
              false
            );
          }
        }
      }
    }
  }
  onLinesCleared() {}

  /**
   * @inheritdoc
   */
  onLineClear(row: number) {}

  rerenderGrid() {
    if (!this._simulation) {
      return;
    }
    this._renderCells(this._simulation.grid.reducedCells);
    this._renderTopPadding();
  }

  private _renderTopPadding() {
    if (
      !this._simulation ||
      (this.simulation?.settings.gameModeType || 'infinity') !== 'infinity'
    ) {
      // only fill in top paddings for challenges in the infinity game mode
      // this is to prevent issues in the garbage defense game mode when the top row gets filled with garbage
      // TODO: find a better solution
      return;
    }
    // extend top row to top of the screen
    for (const cell of this._simulation.grid.cells[0]) {
      if (!cell.isEmpty && !cell.player) {
        for (let y = 1; y <= this._numPaddingRows; y++) {
          this._renderCell(cell, -y);
        }
      }
    }
  }

  onGridReset(_grid: IGrid): void {
    this._resetCache();
    this.rerenderGrid();
  }

  private _resetCache() {
    ++this._cacheId;
  }

  protected _resize = async () => {
    if (!this._simulation) {
      return;
    }
    this._resetCache();
    super._resize();
    this._numPaddingRows = Math.max(
      Math.ceil((this._appHeight - this._gridHeight) / this._cellSize),
      0
    );

    this._gridLines.render(
      this._cellSize,
      this._cellPadding,
      this._hasScrollX,
      this._hasScrollY
    );
    this._gridLines.update(
      this._world.x,
      this._world.y,
      this._hasScrollX,
      this._hasScrollY,
      this._cellSize,
      this._visibilityX,
      this._visibilityY,
      this._camera.y
    );

    this._gridFloor.resize(this._floorHeight);
    this._worldBackground.resize();

    this.rerenderGrid();

    this._towerIndicator.render(this._cellSize);
    this._lineClearingIndicator.render(
      this.simulation!.grid.numRows,
      this._cellSize,
      this._worldBackground.config.floorColor,
      0
    );

    for (const block of Object.values(this._blocks)) {
      this._renderBlock(block.originalBlock);
    }
    for (const player of Object.values(this._players)) {
      this._renderPlayer(player.originalPlayer);
    }

    if (this._shadowGradientGraphics) {
      this._shadowGradientGraphics.cacheAsBitmap = false;
    }
    this._shadowGradientGraphics?.clear();
    if (
      this._shadowGradientGraphics &&
      this._hasShadows &&
      this._shadowCount > 1
    ) {
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
    if (this._challengeEditorGuide) {
      this._challengeEditorGuide.container.removeChildren();
      this._challengeEditorGuide.children = [];
      this._challengeEditorGuide.container.x = 0;
      this._challengeEditorGuide.container.y = 0;
      this.renderCopies(
        this._challengeEditorGuide,
        1,
        (graphics, shadowIndexWithDirection) => {
          graphics.clear();
          graphics.beginFill(0xaaffff, 0.25);
          graphics.lineStyle(this._cellSize * 0.1, 0x00ffff);
          graphics.drawRect(0, 0, this._gridWidth, this._gridHeight);

          const shadowX = shadowIndexWithDirection * this._gridWidth;
          graphics.position.set(shadowX, 0);
        },
        () => {
          const graphics = new PIXI.Graphics();
          this._challengeEditorGuide!.container.addChild(graphics);
          return graphics;
        }
      );
    }
    this._app.view.style.visibility = 'visible';
    this._gameModeRenderer?.resize();
  };

  private _renderCells(cells: ICell[]) {
    cells.forEach((cell) => (cell.requiresRerender = true));
  }

  private _getRenderableCell(cell: ICell, rowOffset = 0): IRenderableCell {
    if (!this._simulation) {
      throw new Error('No simulation');
    }
    const cellIndex =
      (cell.row + rowOffset) * this._simulation.grid.numColumns + cell.column;
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
    return renderableCell;
  }

  private _renderCell = (cell: ICell, rowOffset = 0) => {
    if (!this._simulation) {
      return;
    }
    const renderableCell = this._getRenderableCell(cell, rowOffset);

    renderableCell.container.x = this.getWrappedX(
      renderableCell.cell.column * this._cellSize
    );
    renderableCell.container.y =
      (renderableCell.cell.row + rowOffset) * this._cellSize;

    this._renderCellCopies(renderableCell, cell, rowOffset);
    //}
    /*else {
      renderableCell.children.forEach((child) => {
        child.renderableObject.graphics?.clear();
        if (child.renderableObject.patternSprite) {
          child.renderableObject.patternSprite.visible = false;
        }
      });
    }*/
  };

  private _renderBlock(block: IBlock) {
    if (!this._cellSize) {
      return;
    }
    const blockContainer: IBlockContainer = this._blocks[block.player.id];
    if (!blockContainer) {
      return;
    }

    this.renderCopies(
      blockContainer.block,
      1,
      (pixiObject, shadowIndexWithDirection, child) => {
        if (
          !pixiObject.faceSprite &&
          block.player.characterId &&
          this._app.loader.resources[this._getFaceUrl(block.player.characterId)]
            ?.isComplete
        ) {
          pixiObject.faceSprite = PIXI.Sprite.from(
            this._getFaceUrl(block.player.characterId!)
          );
          pixiObject.faceSprite.anchor.set(0.5, 0.5);
          pixiObject.faceSprite.zIndex = 1;
          child.renderableObject.container.addChild(pixiObject.faceSprite);
        }

        if (pixiObject.faceSprite) {
          pixiObject.faceSprite.scale.set(
            (this._cellSize / pixiObject.faceSprite.texture.width) * 2
          );
        }

        let i = 0;
        for (let r = 0; r < block.initialLayout.length; r++) {
          for (let c = 0; c < block.initialLayout.length; c++) {
            const connections: CellConnection[] = [];
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dy !== 0 || dx !== 0) {
                  if (block.initialLayout[r + dy]?.[c + dx]) {
                    connections.push({ column: c + dx, row: r + dy, dx, dy });
                  }
                }
              }
            }

            if (block.initialLayout[r][c]) {
              this._renderCellInternal(
                pixiObject.cells[i],
                pixiObject.container,
                r,
                c,
                false,
                block.player.color,
                block.player.patternFilename,
                connections,
                undefined,
                block.player
              );

              pixiObject.cells[i].graphics.x =
                (c - block.initialLayout.length / 2) * this._cellSize;
              pixiObject.cells[i].graphics.y =
                (r - block.initialLayout.length / 2) * this._cellSize;

              if (i === 0 && pixiObject.faceSprite) {
                const isSquare = block.initialLayout.length === 2;
                pixiObject.faceSprite.x =
                  pixiObject.cells[i].graphics.x +
                  this._cellSize * (isSquare ? 1 : 0.5);
                pixiObject.faceSprite.y =
                  pixiObject.cells[i].graphics.y +
                  this._cellSize * (isSquare ? 1 : 0.5);
              }

              if (pixiObject.cells[i].patternSprite) {
                pixiObject.cells[i].patternSprite!.x =
                  pixiObject.cells[i].graphics.x;
                pixiObject.cells[i].patternSprite!.y =
                  pixiObject.cells[i].graphics.y;
              }

              const shadowX = shadowIndexWithDirection * this._gridWidth;
              pixiObject.container.x = shadowX;
              ++i;
            }
          }
        }
      },
      () => {
        const container = new PIXI.Container();
        blockContainer.block.container.addChild(container);
        return {
          container,
          faceSprite: undefined,
          // cells: block.cells.map ... (removed due to block supporting negative position)
          // TODO: block could have virtual cells instead of an empty array of cells?
          cells: [...new Array(LayoutUtils.getNumCells(block.layout))].map(
            (_) => {
              const renderableObject: RenderableCellObject = {
                graphics: new PIXI.Graphics(),
                patternSprite: undefined,
                patternSpriteFilename: undefined,
              };
              container.addChild(renderableObject.graphics);
              return renderableObject;
            }
          ),
        };
      }
    );
  }

  private _renderParticle(particle: IParticle, color: number) {
    const particleSize = this._cellSize * 0.1;
    this.renderCopies(
      particle,
      1,
      (graphics, shadowIndexWithDirection) => {
        const shadowX = shadowIndexWithDirection * this._gridWidth;
        graphics.x = shadowX;
        graphics.clear();
        graphics.beginFill(color);
        if (particle.type === 'capture' || particle.type === 'fountain') {
          graphics.drawCircle(0, 0, particleSize);
        } else {
          graphics.lineStyle(this._cellPadding, 0);
          graphics.drawRect(
            -particleSize,
            -particleSize,
            particleSize * 2,
            particleSize * 2
          );
        }
      },
      () => {
        const graphics = new PIXI.Graphics();
        particle.container.addChild(graphics);
        return graphics;
      }
    );
  }

  private _renderCellCopies(
    renderableCell: IRenderableCell,
    cell: ICell,
    rowOffset = 0
  ) {
    if (!this._simulation) {
      return;
    }
    const color: number = cell.player?.color ?? cell.color;
    const patternFilename: string | undefined = cell.player?.patternFilename;
    const behaviour: ICellBehaviour = cell.behaviour;

    const connections: CellConnection[] = [];
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        if (r !== 0 || c !== 0) {
          const neighbour = this._simulation.grid.getNeighbour(
            renderableCell.cell,
            c,
            r
          );
          if (
            neighbour?.isConnectedTo(renderableCell.cell) ||
            (r === -1 && cell.row === 0 && this._numPaddingRows > 0) ||
            (r === 1 &&
              cell.row === 0 &&
              rowOffset !== 0 &&
              this._numPaddingRows > 0)
          ) {
            connections.push({
              column: neighbour?.column ?? 0,
              row: neighbour?.row ?? r,
              dx: c,
              dy: r,
            });
          }
        }
      }
    }

    const cellToCache: CachedRenderableCell = {
      connections,
      color,
      patternFilename,
      imageFilename: cell.behaviour.getImageFilename?.(),
      isEmpty: cell.isEmpty,
      cacheId: this._cacheId,
      type: cell.type,
    };
    const cellIndexWithRowOffset = cell.index - rowOffset * MAX_COLUMNS;
    const cachedCell = this._cachedRenderableCells[cellIndexWithRowOffset];
    this._cachedRenderableCells[cellIndexWithRowOffset] = cellToCache;
    if (
      cachedCell &&
      cellToCache.cacheId === cachedCell.cacheId &&
      cellToCache.isEmpty === cachedCell.isEmpty &&
      cellToCache.color === cachedCell.color &&
      cellToCache.type === cachedCell.type &&
      cellToCache.patternFilename === cachedCell.patternFilename &&
      cellToCache.imageFilename === cachedCell.imageFilename &&
      (cellToCache.isEmpty ||
        JSON.stringify(cellToCache.connections) ===
          JSON.stringify(cachedCell.connections))
    ) {
      return;
    }

    this.renderCopies(
      renderableCell,
      1,
      (_, shadowIndexWithDirection, child) => {
        if (!this._simulation) {
          return;
        }

        this._renderCellInternal(
          child.renderableObject,
          renderableCell.container,
          renderableCell.cell.row,
          renderableCell.cell.column,
          renderableCell.cell.isEmpty,
          color,
          patternFilename,
          connections,
          behaviour,
          renderableCell.cell.player
        );

        const shadowX = shadowIndexWithDirection * this._gridWidth;

        child.renderableObject.graphics.x = shadowX;
        if (child.renderableObject.patternSprite) {
          child.renderableObject.patternSprite.x = shadowX;
        }
        if (!renderableCell.cell.player) {
          // make non-player sprites to rotate around center
          if (child.renderableObject.patternSprite) {
            child.renderableObject.patternSprite.anchor.set(0.5, 0.5);
            child.renderableObject.patternSprite.x += this._cellSize * 0.5;
            child.renderableObject.patternSprite.y += this._cellSize * 0.5;
          }
        }
      },
      () => {
        const graphics = new PIXI.Graphics();
        renderableCell.container.addChild(graphics);
        return {
          graphics,
          patternSprite: undefined,
          patternSpriteFilename: undefined,
        };
      }
    );
  }

  private _renderCellInternal(
    renderableObject: RenderableCellObject,
    container: PIXI.Container,
    row: number,
    column: number,
    isEmpty: boolean,
    color: number,
    patternFilename: string | undefined,
    connections: CellConnection[],
    behaviour?: ICellBehaviour,
    player?: IPlayer
  ) {
    // TODO: reduce duplication managing and removing sprites, for behaviour/block based cells
    const { graphics } = renderableObject;
    graphics.clear();

    let { patternSprite, patternSpriteFilename } = renderableObject;
    if (behaviour && !player) {
      //const oldPatternSpriteFilename = patternSpriteFilename;
      const newPatternSpriteFilename = getCellBehaviourImageFilename(
        behaviour,
        this._worldType,
        this._worldVariation,
        this._challengeEditorEnabled
      );

      // FIXME: sprites are being destroyed and created every frame
      if (
        /*!patternSprite ||
        !patternSprite.visible ||
        oldPatternSpriteFilename !== newPatternSpriteFilename*/ true
      ) {
        if (patternSprite /* && !patternSprite?.visible*/) {
          patternSprite.destroy();
          container.removeChild(patternSprite);
          renderableObject.patternSprite = undefined;
        }
        patternSprite = renderCellBehaviour(
          newPatternSpriteFilename,
          connections,
          behaviour
        );
        if (patternSprite) {
          container.addChild(patternSprite);
          renderableObject.patternSprite = patternSprite;
          renderableObject.patternSpriteFilename = newPatternSpriteFilename;
          container.zIndex = behaviour.getZIndex?.() ?? 0;
        }
      }
      if (patternSprite) {
        patternSprite.width = patternSprite.height = this._cellSize;
      }
      return;
    }

    if (isEmpty) {
      if (patternSprite) {
        patternSprite.destroy();
        container.removeChild(patternSprite);
        renderableObject.patternSprite = undefined;
      }
      return;
    }
    if (patternFilename && this._patternTextures[patternFilename]) {
      const patternTexture =
        this._patternTextures[patternFilename][
          (row % numPatternDivisions) +
            numPatternDivisions * (column % numPatternDivisions)
        ];

      if (
        !patternSprite ||
        patternSprite.texture !== patternTexture ||
        patternFilename !== patternSpriteFilename
      ) {
        if (patternSprite) {
          patternSprite.destroy();
          container.removeChild(patternSprite);
        }

        patternSprite = PIXI.Sprite.from(patternTexture);
        container.addChild(patternSprite);
        renderableObject.patternSprite = patternSprite;
        renderableObject.patternSpriteFilename = patternFilename;
      }
      patternSprite.visible = true;
      patternSprite.width = this._cellSize;
      patternSprite.height = this._cellSize;
    } else {
      if (patternSprite) {
        patternSprite.visible = false;
      }
    }

    const cellSize = this._cellSize;
    // TODO: extract rendering of different behaviours
    // FIXME: use cell colour - cell colour and cell behaviour color don't have to be the same
    // e.g. non-empty red key cell

    graphics.beginFill(color);

    graphics.drawRect(0, 0, cellSize, cellSize);

    const hasConnection = (dx: number, dy: number) => {
      return connections.some(
        (c) =>
          c.column === wrap(column + dx, this._simulation!.grid.numColumns) &&
          c.row === row + dy
      );
    };
    //graphics.
    let borderSize = this._cellPadding * 3;
    const borderColor = PIXI.utils.string2hex(
      getBorderColor(PIXI.utils.hex2string(color))
    );

    // darker edges + black outline
    for (let i = 0; i < 2; i++) {
      graphics.beginFill(
        i === 0 ? borderColor : this._worldBackground.blockOutlineColor
      );
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          if (x === y && x === 0) {
            continue;
          }
          if (!hasConnection(x, y)) {
            if (x === 0 || y === 0) {
              // edge
              graphics.drawRect(
                x > 0 ? cellSize - borderSize : 0,
                y > 0 ? cellSize - borderSize : 0,
                x !== 0 ? borderSize : cellSize,
                y !== 0 ? borderSize : cellSize
              );
            } else {
              // corner
              graphics.drawRect(
                x < 0 ? 0 : cellSize - borderSize,
                y < 0 ? 0 : cellSize - borderSize,
                borderSize,
                borderSize
              );
            }
          }
        }
      }
      borderSize = Math.max(borderSize * 0.2, 1);
    }
    //graphics.cacheAsBitmap = true;
  }

  private _renderBlockPlacementShadow(block: IBlock) {
    if (!this._simulation) {
      return;
    }
    const cellSize = this._cellSize;
    const lowestCells = block.cells
      .filter(
        (cell) =>
          !block.cells.find(
            (other) =>
              other.column === cell.column && other.row === cell.row + 1
          )
      )
      // for the pentomino U shape (rotated as a C), only the top cell should be taken
      // XX <---
      // X
      // XX
      .filter(
        (lowestCell, _, array) =>
          !array.some(
            (other) =>
              other.column === lowestCell.column && other.row < lowestCell.row
          )
      );

    this._placementHelperShadowCells.forEach((shadow) => {
      shadow.children.forEach((child) => child.renderableObject.clear());
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
    const blockPlacementCells = block.getPlacementCells();
    const highestBlockPlacementCellRow =
      blockPlacementCells.find((c, i, a) => !a.some((o) => o.row < c.row))
        ?.row ?? -1; // -1 for block negative position, see TODO
    const isMistake =
      this._simulation.settings.mistakeDetection !== false &&
      checkMistake(block.player, blockPlacementCells, this._simulation);
    /*lowestCells.some((cell) => {
        const cellDistanceFromLowestRow = lowestBlockRow - cell.row;
        return this._simulation!.grid.cells[
          highestPlacementRow - cellDistanceFromLowestRow + 1
        ]?.[cell.column].isPassable;
      });*/

    const isTower =
      this._simulation.settings.preventTowers !== false &&
      //isMistake &&
      this._simulation.isTower(highestBlockPlacementCellRow);

    const displayInvalidPlacement = isMistake; /*|| isTower*/
    this._towerIndicator.update(
      !this._hasScrollY ? this._gridLines.y : this._world.y,
      isTower,
      this._simulation,
      this._cellSize
    );

    // render placement helper shadow - this could be done a lot more efficiently by rendering one line per column,
    // but for now it's easier to reuse the cell rendering code (for shadows)
    let cellIndex = 0;
    lowestCells.forEach((lowestCell, index) => {
      const cellDistanceFromLowestRow = lowestBlockRow - lowestCell.row;
      for (
        let y =
          this._blockShadowType === 'placement'
            ? highestBlockPlacementCellRow
            : lowestCell.row + 1;
        y < this._simulation!.grid.numRows;
        y++
      ) {
        const cell = this._simulation!.grid.cells[y][lowestCell.column];
        if (!cell.isPassable) {
          break;
        }
        let renderableCell: IRenderablePlacementHelperCell;
        if (this._placementHelperShadowCells.length > cellIndex) {
          renderableCell = this._placementHelperShadowCells[cellIndex];
        } else {
          renderableCell = {
            cell: lowestCell,
            children: [],
            container: new PIXI.Container(),
          };
          this._world.addChild(renderableCell.container);
          this._placementHelperShadowCells.push(renderableCell);
        }
        renderableCell.container.x = lowestCell.column * cellSize;
        renderableCell.container.y = y * cellSize;
        renderableCell.container.zIndex = -1000;
        const opacity = displayInvalidPlacement ? 0.5 : 0.33;
        const isCause =
          displayInvalidPlacement /*isTower ||*/ &&
          y > highestPlacementRow - cellDistanceFromLowestRow &&
          blockPlacementCells.indexOf(cell) < 0;
        const color = displayInvalidPlacement ? 0xff0000 : block.player.color;
        if (
          this._blockShadowType === 'full' ||
          isCause ||
          blockPlacementCells.indexOf(cell) >= 0
        ) {
          this.renderCopies(
            renderableCell,
            opacity,
            (graphics, shadowIndexWithDirection) => {
              if (!this._simulation) {
                return;
              }
              const shadowX = shadowIndexWithDirection * this._gridWidth;
              graphics.x = shadowX;

              graphics.clear();
              const cellSize = this._cellSize;
              // TODO: extract rendering of different behaviours
              graphics.beginFill(color, Math.min(opacity, 1));
              if (displayInvalidPlacement) {
                if (!isCause) {
                  graphics.drawRect(
                    cellSize * 0.1,
                    cellSize * 0.1,
                    cellSize * 0.8,
                    cellSize * 0.8
                  );
                } else {
                  /*graphics.drawRect(
                    cellSize * 0.3,
                    cellSize * 0.3,
                    cellSize * 0.4,
                    cellSize * 0.4
                  );*/
                  graphics.lineStyle(cellSize * 0.1, color, opacity);
                  graphics.moveTo(cellSize * 0.3, cellSize * 0.3);
                  graphics.lineTo(cellSize * 0.7, cellSize * 0.7);
                  graphics.moveTo(cellSize * 0.7, cellSize * 0.3);
                  graphics.lineTo(cellSize * 0.3, cellSize * 0.7);
                }
              } else {
                graphics.drawRect(0, 0, cellSize, cellSize);
              }
            },
            () => {
              const graphics = new PIXI.Graphics();
              renderableCell.container.addChild(graphics);
              return graphics;
            }
          );
        }

        cellIndex++;
      }
    });
  }

  private _getFaceUrl(characterId: string): string {
    return `${this._clientApiConfig.imagesRootUrl}/faces/${characterId}.png`;
  }
  private _getPatternUrl(patternFilename: string): string {
    return `${this._clientApiConfig.imagesRootUrl}/patterns/${patternFilename}`;
  }
}
