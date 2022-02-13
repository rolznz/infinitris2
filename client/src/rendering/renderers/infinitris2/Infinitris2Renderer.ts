import IRenderer, { ParticleType } from '../../IRenderer';
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
import { InputMethod } from '@models/InputMethod';
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
import { ConquestRenderer } from '@src/rendering/renderers/infinitris2/gameModes/ConquestRenderer';
import { IGameModeRenderer } from '@src/rendering/renderers/infinitris2/gameModes/GameModeRenderer';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { ClientApiConfig } from '@models/IClientApi';

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

interface IRenderableCell
  extends IRenderableEntity<{
    graphics: PIXI.Graphics;
    patternSprite: PIXI.Sprite | undefined;
  }> {
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
}

// TODO: retrieve URLs from players
//const faceUrl = `${imagesDirectory}/face_9.png`;
//this._app.loader.add(this._getFloorImageFilename());

export default class Infinitris2Renderer extends BaseRenderer {
  // FIXME: restructure to not require definite assignment
  private _gridLines!: GridLines;
  private _placementHelperShadowCells!: IRenderablePlacementHelperCell[];
  private _virtualKeyboardGraphics?: PIXI.Graphics;
  private _virtualKeyboardCurrentKeyText!: PIXI.Text;
  private _virtualGestureSprites?: PIXI.Sprite[];

  private _fpsText!: PIXI.Text;

  private _shadowGradientGraphics?: PIXI.Graphics;

  // FIXME: blocks should have their own ids!
  private _blocks!: { [playerId: number]: IRenderableBlock };
  private _cells!: { [cellId: number]: IRenderableCell };

  private _particles!: IParticle[];
  private _virtualKeyboardControls?: ControlSettings;
  private _preferredInputMethod: InputMethod;
  private _teachControls: boolean;
  private _worldBackground!: WorldBackground;
  private _gridFloor!: GridFloor;
  private _patternTextures: { [filename: string]: PIXI.Texture[] } = {};
  private _dayIndicator!: DayIndicator;
  private _spawnDelayIndicator!: SpawnDelayIndicator;
  private _scoreboard!: Scoreboard;
  private _scoreChangeIndicator!: ScoreChangeIndicator;
  private _rendererQuality: RendererQuality | undefined;
  private _worldType: WorldType;

  private _oldOverflowStyle: string;
  private _displayFrameRate = false;
  private _gameModeRenderer: IGameModeRenderer | undefined;

  constructor(
    clientApiConfig: ClientApiConfig,
    preferredInputMethod: InputMethod = 'keyboard',
    teachControls: boolean = false,
    rendererQuality?: RendererQuality,
    worldType: WorldType = 'grass'
  ) {
    super(clientApiConfig);
    this._preferredInputMethod = preferredInputMethod;
    this._teachControls = teachControls;
    this._rendererQuality = rendererQuality;
    this._worldType = worldType;

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

    this._worldBackground = new WorldBackground(
      this._app,
      this._camera,
      this._worldType,
      this._rendererQuality
    );

    this._dayIndicator = new DayIndicator(this._app);

    this._gridFloor = new GridFloor(this._app, this._worldType);
    //this._app.loader.add(faceUrl);

    this._scoreboard = new Scoreboard(this._app);
    this._spawnDelayIndicator = new SpawnDelayIndicator(this._app);
    this._scoreChangeIndicator = new ScoreChangeIndicator(this._app);

    await new Promise((resolve) => this._app.loader.load(resolve));

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

    super.tick();

    if (this._displayFrameRate) {
      this._fpsText.x = this._app.renderer.width / 2;
      this._fpsText.y = 10;
      this._fpsText.anchor.set(0.5, 0);
      this._fpsText.text =
        Math.ceil(this._app.ticker.FPS) +
        ' rFPS\n' +
        this._simulation.fps +
        ' sFPS';
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
      this._clampedCameraY
    );

    if (this._hasScrollX) {
      this.wrapObjects();

      this._worldBackground.update(
        this._hasScrollX,
        this._hasScrollY,
        this._clampedCameraY
      );

      this._gridFloor.update(
        !this._hasScrollY
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
    super.onSimulationInit(simulation);
    this._particles = [];
    this._blocks = {};
    this._cells = {};
    this._app.stage.removeChildren();

    this._worldBackground.addChildren();
    this._gridLines = new GridLines(simulation, this._app, this._camera);

    this._gridFloor.addChildren();

    this._shadowGradientGraphics = new PIXI.Graphics();

    this._app.stage.addChild(this._world);

    this._dayIndicator.addChildren();
    this._spawnDelayIndicator.create();
    this._scoreboard.create();
    this._scoreChangeIndicator.create();
    this._placementHelperShadowCells = [];

    if (simulation.settings.gameModeType === 'conquest') {
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
    this._createBlock(block);
  }
  private _createBlock(block: IBlock) {
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
    // TODO: consider whether there is a better way to render blocks
    this._renderBlock(block); // requires re-render due to borders changing + pattern changing rotation
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
    if (block.player === this._simulation?.followingPlayer) {
      this._placementHelperShadowCells.forEach((shadow) => {
        shadow.children.forEach((child) => child.renderableObject.clear());
      });
    }
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    if (!this._simulation) {
      return;
    }
    this._renderCells(this._simulation.grid.reducedCells); //TODO: only render block + neighbour cells
    //this._renderCells(block.cells);
  }

  onPlayerCreated(player: IPlayer): void {
    if (player.characterId) {
      const faceUrl = this._getFaceUrl(player.characterId);
      if (!this._app.loader.resources[faceUrl]) {
        this._app.loader.add(faceUrl, () => {
          if (player.block) {
            //this._renderBlock(player.block);
          }
        });
      }
    }
    if (player.patternFilename) {
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
        });
      }
    }
  }
  onPlayerDestroyed(player: IPlayer): void {
    this._gameModeRenderer?.onPlayerDestroyed(player);
  }
  onPlayerToggleChat(player: IPlayer): void {}
  onPlayerToggleSpectating() {}

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
        this.emitParticle(
          cell.column + x / particleDivisions,
          cell.row + y / particleDivisions,
          color || cell.color,
          'capture'
        );
      }
    }
  }

  emitParticle(x: number, y: number, color: number, type: ParticleType) {
    const life = type === 'classic' ? 100 : 50;
    const particle: IParticle = {
      x: x + (type === 'capture' ? (Math.random() - 0.5) * 6 : 0),
      y: y + (type === 'capture' ? (Math.random() - 0.5) * 6 : 0),
      vx: type === 'classic' ? (Math.random() - 0.5) * 0.1 : 0,
      vy: type === 'classic' ? -(Math.random() + 0.5) * 0.2 : 0,
      container: new PIXI.Container(),
      children: [],
      maxLife: life,
      life,
      type,
      goalX: x,
      goalY: y,
    };
    particle.container.alpha = 0;
    this._world.addChild(particle.container);
    this._particles.push(particle);
    this._renderParticle(particle, color);
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
    if (!this._simulation) {
      return;
    }
    const followingPlayer = this._simulation.followingPlayer;
    this._scoreboard.update(
      this._simulation.players,
      followingPlayer,
      this._simulation
    );
    this._scoreChangeIndicator.update(followingPlayer);
    this._spawnDelayIndicator.update(this._simulation, followingPlayer);

    //console.log('Rendering', this._particles.length, 'particles');
    for (const particle of this._particles) {
      if (particle.type === 'classic') {
        particle.vx *= 0.99;
        particle.vy += 0.01;
        particle.container.alpha = particle.life / particle.maxLife;
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

    this._gameModeRenderer?.onSimulationStep();

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
  onSimulationNextRound() {
    this._gameModeRenderer?.restart();
  }

  /**
   * @inheritdoc
   */
  onLineCleared(_row: number) {
    if (!this._simulation) {
      return;
    }
    // TODO: remove, should only render individual cells on cell state change
    this._renderCells(this._simulation.grid.reducedCells);
  }

  rerenderGrid() {
    if (!this._simulation) {
      return;
    }
    this._renderCells(this._simulation.grid.reducedCells);
  }

  /**
   * @inheritdoc
   */
  onGridCollapsed(_grid: IGrid) {
    if (!this._simulation) {
      return;
    }
    // TODO: optimize
    this._renderCells(this._simulation.grid.reducedCells);
  }

  onGridReset(grid: IGrid): void {
    if (!this._simulation) {
      return;
    }
    // TODO: optimize
    this._renderCells(this._simulation.grid.reducedCells);
  }

  // TODO: move to base renderer
  protected _resize = async () => {
    if (!this._simulation) {
      return;
    }
    super._resize();

    this._gridFloor.resize(this._floorHeight);

    this._renderVirtualKeyboard();
    this._renderVirtualGestures();

    this._gridLines.render(
      this._gridWidth,
      this._gridHeight,
      this._cellSize,
      this._cellPadding,
      this._hasScrollX,
      this._hasScrollY
    );

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

  private _renderCells(cells: ICell[]) {
    cells.forEach((cell) => this._renderCell(cell));
  }

  private _renderCell = (cell: ICell) => {
    if (!this._simulation) {
      return;
    }
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
      renderableCell.container.x = this.getWrappedX(
        renderableCell.cell.column * this._cellSize
      );
      renderableCell.container.y = renderableCell.cell.row * this._cellSize;
      this._renderCellCopies(
        renderableCell,
        RenderCellType.Cell,
        cell.color,
        cell.player?.patternFilename
      );
    } else {
      renderableCell.children.forEach((child) => {
        child.renderableObject.graphics.clear();
        if (child.renderableObject.patternSprite) {
          child.renderableObject.patternSprite.visible = false;
        }
      });
    }
  };

  private _renderBlock(block: IBlock) {
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];
    if (!renderableBlock) {
      return;
    }
    this._moveBlock(block);

    renderableBlock.cells.forEach((cell) => {
      this._renderCellCopies(
        cell,
        RenderCellType.Block,
        block.player.color,
        block.player.patternFilename
      );
    });

    this._renderCopies(
      renderableBlock.playerNameText,
      1,
      (text, shadowIndexWithDirection) => {
        const shadowX = shadowIndexWithDirection * this._gridWidth;
        text.x = shadowX;
      },
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
        text.anchor.set(0.5, 1);
        renderableBlock.playerNameText.container.addChild(text);
        return text;
      }
    );
    if (
      block.player.characterId &&
      this._app.loader.resources[this._getFaceUrl(block.player.characterId)]
        ?.isComplete
    )
      this._renderCopies(
        renderableBlock.face,
        1,
        (face, shadowIndexWithDirection) => {
          const shadowX = shadowIndexWithDirection * this._gridWidth;
          face.x = shadowX;
        },
        () => {
          const faceSprite = PIXI.Sprite.from(
            this._getFaceUrl(block.player.characterId!)
          );
          faceSprite.scale.set((this._cellSize / faceSprite.width) * 2);
          faceSprite.anchor.set(0.5, 0.5);
          renderableBlock.face.container.addChild(faceSprite);
          return faceSprite;
        }
      );

    const followingPlayer = this._simulation?.followingPlayer;
    if (followingPlayer && block.player.id === followingPlayer.id) {
      // render block placement shadow on every frame (it's difficult to figure out if lava transitioned to active/inactive, locks changed etc.)
      const cellSize = this._cellSize;
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

  private _moveBlock(block: IBlock) {
    const cellSize = this._cellSize;
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];

    for (let i = 0; i < block.cells.length; i++) {
      renderableBlock.cells[i].cell = block.cells[i];
    }

    renderableBlock.cells.forEach((cell) => {
      cell.container.x = cell.cell.column * cellSize;
      cell.container.y = cell.cell.row * cellSize;
    });

    const textCentreX = block.centreX * cellSize;
    const textY = block.topRow * cellSize - cellSize * 1;
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
    const particleSize = this._cellSize * 0.1;
    this._renderCopies(
      particle,
      1,
      (graphics, shadowIndexWithDirection) => {
        const shadowX = shadowIndexWithDirection * this._gridWidth;
        graphics.x = shadowX;
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawCircle(0, 0, particleSize);
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
    renderCellType: RenderCellType,
    color: number,
    patternFilename: string | undefined
  ) {
    if (!this._simulation) {
      return;
    }
    this._renderCopies(
      renderableCell,
      1,
      ({ graphics, patternSprite }, shadowIndexWithDirection, child) => {
        if (!this._simulation) {
          return;
        }

        if (patternFilename && this._patternTextures[patternFilename]) {
          const patternTexture =
            this._patternTextures[patternFilename][
              (renderableCell.cell.row % numPatternDivisions) +
                numPatternDivisions *
                  (renderableCell.cell.column % numPatternDivisions)
            ];

          if (!patternSprite || patternSprite.texture !== patternTexture) {
            if (patternSprite) {
              renderableCell.container.removeChild(patternSprite);
              console.log('Replace texture');
            }

            patternSprite = PIXI.Sprite.from(patternTexture);
            renderableCell.container.addChild(patternSprite);
            child.renderableObject.patternSprite = patternSprite;
          }
          patternSprite.visible = true;
          patternSprite.width = this._cellSize;
          patternSprite.height = this._cellSize;
        } else {
          if (patternSprite) {
            patternSprite.visible = false;
          }
        }

        const shadowX = shadowIndexWithDirection * this._gridWidth;
        graphics.x = shadowX;
        if (patternSprite) {
          patternSprite.x = shadowX;
        }

        graphics.clear();
        const cellSize = this._cellSize;
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
          graphics.beginFill(color);

          graphics.drawRect(0, 0, cellSize, cellSize);
          //graphics.
          const borderSize = this._cellPadding * 2;
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
            graphics.drawRect(cellSize - borderSize, 0, borderSize, borderSize);
          }
          if (
            !this._simulation.grid
              .getNeighbour(renderableCell.cell, -1, 1)
              ?.isConnectedTo(renderableCell.cell)
          ) {
            graphics.drawRect(0, cellSize - borderSize, borderSize, borderSize);
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

        if (renderableCell.cell.isEmpty) {
          switch (renderableCell.cell.type) {
            case CellType.Wafer:
              graphics.beginFill(color);

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
              graphics.beginFill(color);

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
              graphics.beginFill(color, 0.5);
              graphics.drawRect(0, 0, cellSize, cellSize);

              graphics.beginFill(color);
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
      () => {
        const graphics = new PIXI.Graphics();

        // pattern sprite needs to be regenerated each time the block rotates (need to pick a new texture)
        let patternSprite = undefined;

        renderableCell.container.addChild(graphics);

        return { graphics, patternSprite };
      }
    );
  }

  private _renderBlockPlacementShadow(block: IBlock) {
    if (!this._simulation) {
      return;
    }
    const cellSize = this._cellSize;
    const lowestCells = block.cells.filter(
      (cell) =>
        !block.cells.find(
          (other) => other.column === cell.column && other.row > cell.row
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
        let renderableCell: IRenderablePlacementHelperCell;
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
        /*this._renderCellCopies(
          renderableCell,
          RenderCellType.PlacementHelper,
          isTower ? 0.66 : 0.33,
          isTower ? 0xff0000 : block.player.color,
          isTower
        );*/
        const opacity = isTower ? 0.66 : 0.33;
        const color = isTower ? 0xff0000 : block.player.color;
        this._renderCopies(
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
          },
          () => {
            const graphics = new PIXI.Graphics();
            renderableCell.container.addChild(graphics);
            return graphics;
          }
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
  private _getFaceUrl(characterId: string): string {
    return `${this._clientApiConfig.imagesRootUrl}/faces/${characterId}.png`;
  }
  private _getPatternUrl(patternFilename: string): string {
    return `${this._clientApiConfig.imagesRootUrl}/patterns/${patternFilename}`;
  }
}
