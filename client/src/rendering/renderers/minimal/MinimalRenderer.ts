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

const minCellSize = 32;
const particleDivisions = 4;
interface IRenderableGrid {
  grid: Grid;
  graphics: PIXI.Graphics;
}
interface IRenderableBlock {
  block: IBlock;
  cells: IRenderableCell[];
  playerNameText: PIXI.Text;
}

enum RenderCellType {
  Block,
  Cell,
  PlacementHelper,
}

interface IRenderableEntity {
  // stores all the graphics objects - main render + all shadows
  container: PIXI.Container;
  children: {
    shadowIndex: number;
    graphics: PIXI.Graphics;
  }[];
}

interface IRenderableCell extends IRenderableEntity {
  cell: ICell;
  // a cell will be rendered 1 time on wrapped grids, N times for shadow wrapping (grid width < screen width)
}

/*interface IPlayerScore {
  playerId: number;
  text: PIXI.Text;
}*/

interface IParticle extends IRenderableEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default class MinimalRenderer
  implements IRenderer, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _grid!: IRenderableGrid;
  private _placementHelperShadowCells!: IRenderableCell[];
  private _virtualKeyboardGraphics?: PIXI.Graphics;
  private _virtualKeyboardCurrentKeyText!: PIXI.Text;
  private _virtualGestureSprites?: PIXI.Sprite[];
  private _app!: PIXI.Application;
  private _world!: PIXI.Container;

  // FIXME: blocks should have their own ids!
  private _blocks!: { [playerId: number]: IRenderableBlock };
  private _cells!: { [cellId: number]: IRenderableCell };
  private _particles!: IParticle[];
  //private _playerScores!: IPlayerScore[];

  private _simulation!: Simulation;

  private _camera!: Camera;
  private _gridWidth!: number;
  private _gridHeight!: number;
  private _cellSize!: number;
  private _scrollY!: boolean;
  private _scrollX!: boolean;
  private _hasShadows!: boolean;
  private _shadowCount!: number;
  private _virtualKeyboardControls?: ControlSettings;
  private _allowedActions?: InputAction[];
  private _preferredInputMethod: InputMethod;
  private _teachControls: boolean;

  constructor(
    preferredInputMethod: InputMethod = 'keyboard',
    teachControls: boolean = false
  ) {
    this._preferredInputMethod = preferredInputMethod;
    this._teachControls = teachControls;
  }

  set virtualKeyboardControls(
    virtualKeyboardControls: ControlSettings | undefined
  ) {
    this._virtualKeyboardControls = virtualKeyboardControls;
  }

  set allowedActions(allowedActions: InputAction[] | undefined) {
    this._allowedActions = allowedActions;
    this._renderVirtualKeyboard();
    this._renderVirtualGestures();
  }

  /**
   * @inheritdoc
   */
  async create() {
    this._app = new PIXI.Application({
      resizeTo: window,
      antialias: true,
    });

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

    window.addEventListener('resize', this._resize);
    this._resize();
    this._app.ticker.add(this._tick);
  }

  private _tick = () => {
    const visibilityX = this._getVisiblityX();
    const visibilityY = this._app.renderer.height * 0.125;

    this._camera.update();

    // clamp the camera to fit within the grid
    const cameraY = Math.min(
      Math.max(
        this._camera.y,
        -(this._gridHeight - this._app.renderer.height + visibilityY)
      ),
      -visibilityY
    );
    if (this._scrollX) {
      this._world.x = this._camera.wrappedX + visibilityX;
    }
    if (this._scrollY) {
      this._world.y = cameraY + visibilityY;
    }

    if (this._scrollX) {
      this._grid.graphics.x =
        ((this._camera.wrappedX + visibilityX) % this._cellSize) -
        this._cellSize;
      if (!this._hasShadows) {
        this._wrapObjects();
      }
    }
    if (this._scrollY) {
      this._grid.graphics.y =
        ((cameraY + visibilityY) % this._cellSize) - this._cellSize;
    }

    if (this._hasShadows) {
      Object.values(this._blocks).forEach((block) => {
        block.cells.forEach((cell) => this._applyShadowAlpha(cell));
      });
      this._placementHelperShadowCells.forEach((renderableCell) =>
        this._applyShadowAlpha(renderableCell)
      );
    }
    Object.values(this._cells).forEach((cell) => {
      if (cell.cell.behaviour.requiresRerender) {
        this._renderCell(cell.cell);
      }
      cell.container.alpha = cell.cell.isEmpty ? cell.cell.behaviour.alpha : 1;
      if (this._hasShadows) {
        this._applyShadowAlpha(cell);
      }

      if (cell.cell.type === CellType.Laser) {
        const cellBehaviour = cell.cell.behaviour as LaserBehaviour;
        cell.container.alpha = cellBehaviour.alpha;
      } else if (cell.cell.type === CellType.Lock) {
        const cellBehaviour = cell.cell.behaviour as LockBehaviour;
        if (cellBehaviour.isLocked) {
        }
      }
    });
  };

  private _applyShadowAlpha(cell: IRenderableCell) {
    cell.children.forEach((child) => {
      const distance = Math.min(
        Math.abs(cell.container.x + child.graphics.x + this._camera.wrappedX),
        this._app.renderer.width * 0.5
      );

      const alpha = Math.min(
        1 -
          Math.min(
            (distance * Math.max(this._shadowCount / 2, 1)) /
              this._app.renderer.width,
            1
          )
      );
      child.graphics.tint = PIXI.utils.rgb2hex([alpha, alpha, alpha]);
    });
  }

  private _wrapObjects() {
    this._world.children.forEach((child) => {
      this._wrapObject(child);
    });
  }

  private _wrapObject(child: PIXI.DisplayObject) {
    const visibilityX = this._getVisiblityX();
    if (child.x + this._cellSize < -this._camera.wrappedX - visibilityX) {
      child.x += this._gridWidth;
    } else if (
      child.x + this._cellSize >=
      -this._camera.wrappedX + this._gridWidth - visibilityX
    ) {
      child.x -= this._gridWidth;
    }
  }

  /**
   * @inheritdoc
   */
  destroy() {
    window.removeEventListener('resize', this._resize);
    if (this._app) {
      this._app.destroy(true);
    }
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: Simulation) {
    this._simulation = simulation;
    this._app.stage.removeChildren();

    this._grid = {
      grid: simulation.grid,
      graphics: new PIXI.Graphics(),
    };
    this._app.stage.addChild(this._grid.graphics);

    this._world = new PIXI.Container();
    this._world.sortableChildren = true;
    this._app.stage.addChild(this._world);

    this._placementHelperShadowCells = [];

    /*this._playerScores = [...Array(10)].map((_, i) => ({
      playerId: -1,
      text: new PIXI.Text('', {
        font: 'bold italic 60px Arvo',
        fill: '#3e1707',
        align: 'center',
        stroke: '#a4410e',
        strokeThickness: 7,
      }),
    }));*/

    //this._app.stage.addChild(...this._playerScores.map((score) => score.text));

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

    this._resize();
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
      playerNameText: new PIXI.Text(block.player.nickname, {
        font: 'bold italic 60px Arvo',
        fill: PIXI.utils.hex2string(block.player.color),
        align: 'center',
        stroke: '#000000',
        strokeThickness: 7,
      }),
    };
    this._world.addChild(renderableBlock.playerNameText);
    renderableBlock.playerNameText.anchor.set(0.5, 0);

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
    this._moveBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {
    if (this._simulation.isFollowingPlayerId(block.player.id)) {
      this._camera.moveWrapIndex(wrapIndexChange);
    }
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._removeBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._renderCells(block.cells);
    this._removeBlock(block);
  }

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
    this._world.removeChild(
      ...renderableBlock.cells.map((cell) => cell.container)
    );
    this._world.removeChild(renderableBlock.playerNameText);
    delete this._blocks[block.player.id];
  }

  /**
   * @inheritdoc
   */
  onSimulationStep() {
    const followingPlayer = this._simulation.players.find((player) =>
      this._simulation.isFollowingPlayerId(player.id)
    );
    if (followingPlayer && followingPlayer.block) {
      // render block placement shadow on every frame (it's difficult to figure out if lava transitioned to active/inactive, locks changed etc.)
      const cellSize = this._getClampedCellSize();
      const block = followingPlayer.block;
      const blockX = block.column * cellSize;
      const y = block.row * cellSize;
      this._camera.follow(
        blockX + block.width * cellSize * 0.5,
        y,
        block.player.id
      );
      this._renderBlockPlacementShadow(block);
    }
    // TODO: only run this once per second
    /*const scores = this._simulation.players.map((p) => ({
      id: p.id,
      name: 'New player',
      score: p.score,
    }));
    scores.sort((a, b) => b.score - a.score);
    for (let i = 0; i < this._playerScores.length; i++) {
      if (scores.length > i) {
        this._playerScores[i].text.text =
          scores[i].name + ' ' + scores[i].score;
      } else {
        this._playerScores[i].text.text = '';
      }
    }*/

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

  /**
   * @inheritdoc
   */
  onLineCleared(_row: number) {
    // TODO: remove, should only render individual cells on cell state change
    this._renderCells(this._grid.grid.reducedCells);
  }

  private _getCellSize = () => {
    const height = this._app.renderer.height;
    return Math.ceil((minCellSize * height) / 768);
  };

  private _getClampedCellSize = () => {
    return Math.max(this._getCellSize(), minCellSize);
  };

  private _resize = async () => {
    this._blocks = {};
    this._cells = {};
    this._camera = new Camera();
    this._camera.reset();

    this._particles = [];

    const appWidth = this._app.renderer.width;
    const appHeight = this._app.renderer.height;
    const cellSize = this._getClampedCellSize();
    this._cellSize = cellSize;

    this._renderVirtualKeyboard();
    this._renderVirtualGestures();

    if (this._grid) {
      this._grid.graphics.clear();

      const gridWidth = this._grid.grid.numColumns * cellSize;
      this._gridWidth = gridWidth;
      const gridHeight = this._grid.grid.numRows * cellSize;
      this._gridHeight = gridHeight;
      this._scrollX = true;
      this._hasShadows = gridWidth < appWidth;
      this._scrollY = gridHeight > appHeight;

      this._shadowCount = this._hasShadows
        ? Math.ceil(Math.ceil(appWidth / gridWidth) / 2)
        : 0;

      this._camera.gridWidth = gridWidth;

      if (!this._scrollX) {
        this._world.x = this._grid.graphics.x = (appWidth - gridWidth) / 2;
      }
      if (!this._scrollY) {
        this._world.y = this._grid.graphics.y = (appHeight - gridHeight) / 2;
      }

      const gridRows = this._scrollY
        ? Math.ceil(appHeight / cellSize) + 2
        : this._grid.grid.numRows;
      const gridColumns = this._scrollX
        ? Math.ceil(appWidth / cellSize) + 1
        : this._grid.grid.numColumns;

      this._grid.graphics.lineStyle(1, 0xaaaaaa, 0.5);
      for (let r = 0; r < gridRows + 1; r++) {
        this._grid.graphics.moveTo(0, r * cellSize);
        this._grid.graphics.lineTo(gridColumns * cellSize, r * cellSize);
      }

      for (let c = 0; c < gridColumns + 1; c++) {
        this._grid.graphics.moveTo(c * cellSize, 0);
        this._grid.graphics.lineTo(c * cellSize, gridHeight);
      }

      this._renderCells(this._grid.grid.reducedCells);

      for (const block of Object.values(this._blocks)) {
        this._renderBlock(block.block);
      }
    }
  };

  private _renderCells(cells: ICell[]) {
    cells.forEach((cell) => this._renderCell(cell));
  }

  private _renderCell = (cell: ICell) => {
    const cellIndex = cell.row * this._grid.grid.numColumns + cell.column;
    if (!this._cells[cellIndex]) {
      this._cells[cellIndex] = {
        cell,
        container: this._world.addChild(new PIXI.Container()),
        children: [],
      };
    }
    const renderableCell: IRenderableCell = this._cells[cellIndex];

    if (!cell.isEmpty || cell.behaviour.type !== CellType.Normal) {
      const cellSize = this._getClampedCellSize();
      renderableCell.container.x = renderableCell.cell.column * cellSize;
      renderableCell.container.y = renderableCell.cell.row * cellSize;
      this._renderCellCopies(
        renderableCell,
        RenderCellType.Cell,
        1,
        cell.color
      );
    } else {
      renderableCell.children.forEach((child) => child.graphics.clear());
    }
  };

  private _renderBlock(block: IBlock) {
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];
    this._moveBlock(block);

    renderableBlock.cells.forEach((cell) => {
      this._renderCellCopies(cell, RenderCellType.Block, 1, block.player.color);
    });
  }

  private _getVisiblityX() {
    return this._app.renderer.width * 0.5;
  }

  private _moveBlock(block: IBlock) {
    const cellSize = this._getClampedCellSize();
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];

    for (let i = 0; i < block.cells.length; i++) {
      renderableBlock.cells[i].cell = block.cells[i];
    }

    renderableBlock.cells.forEach((cell) => {
      cell.container.x = cell.cell.column * cellSize;
      cell.container.y = cell.cell.row * cellSize;
    });

    const textCentreX = block.centreX * cellSize;
    const textY =
      block.row * cellSize - renderableBlock.playerNameText.height * 1.2;
    renderableBlock.playerNameText.x = textCentreX;
    renderableBlock.playerNameText.y = textY;
  }

  private _renderParticle(particle: IParticle, color: number) {
    const particleSize = this._getCellSize() / particleDivisions;
    this._renderCopies(particle, 1, (graphics) => {
      graphics.beginFill(color);
      graphics.drawRect(0, 0, particleSize, particleSize);
    });
  }

  private _renderCellCopies(
    renderableCell: IRenderableCell,
    renderCellType: RenderCellType,
    opacity: number,
    color: number
  ) {
    this._renderCopies(renderableCell, opacity, (graphics: PIXI.Graphics) => {
      const cellSize = this._getClampedCellSize();
      // TODO: extract rendering of different behaviours
      if (
        renderCellType !== RenderCellType.Cell ||
        (renderableCell.cell.type === CellType.FinishChallenge &&
          renderableCell.cell.isEmpty) ||
        renderableCell.cell.type === CellType.Laser ||
        renderableCell.cell.type === CellType.Infection ||
        renderableCell.cell.type === CellType.Deadly
      ) {
        graphics.beginFill(color, Math.min(opacity, 1));
        graphics.drawRect(0, 0, cellSize, cellSize);
      } else if (!renderableCell.cell.isEmpty) {
        // FIXME: use cell colour - cell colour and cell behaviour color don't have to be the same
        // e.g. non-empty red key cell
        graphics.beginFill(renderableCell.cell.color, Math.min(opacity, 1));
        graphics.drawRect(0, 0, cellSize, cellSize);
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
    });
  }

  private _renderCopies(
    renderableEntity: IRenderableEntity,
    opacity: number,
    renderFunction: (graphics: PIXI.Graphics) => void,
    shadowIndex: number = 0,
    shadowDirection: number = 0
  ) {
    const shadowIndexWithDirection = shadowIndex * shadowDirection;
    let entry = renderableEntity.children.find(
      (child) => child.shadowIndex === shadowIndexWithDirection
    );
    if (!entry) {
      entry = {
        graphics: new PIXI.Graphics(),
        shadowIndex: shadowIndexWithDirection,
      };
      renderableEntity.children.push(entry);
      renderableEntity.container.addChild(entry.graphics);
    }

    const graphics = entry.graphics;
    graphics.clear();

    renderFunction(graphics);

    graphics.x = shadowIndexWithDirection * this._gridWidth;
    if (shadowIndex < this._shadowCount) {
      (shadowDirection === 0 ? [-1, 1] : [shadowDirection]).forEach((i) =>
        this._renderCopies(
          renderableEntity,
          opacity, // * 0.5,
          renderFunction,
          shadowIndex + 1,
          i
        )
      );
    }
  }

  private _renderBlockPlacementShadow(block: IBlock) {
    const cellSize = this._getClampedCellSize();
    const lowestCells = block.cells.filter(
      (cell) =>
        !block.cells.find(
          (other) => other.column === cell.column && other.row > cell.row
        )
    );

    this._placementHelperShadowCells.forEach((shadow) => {
      shadow.children.forEach((child) => child.graphics.clear());
    });

    const lowestBlockRow = lowestCells
      .map((cell) => cell.row)
      .sort((a, b) => b - a)[0];

    let highestPlacementRow = this._grid.grid.numRows - 1;

    for (const cell of lowestCells) {
      for (let y = cell.row; y < highestPlacementRow; y++) {
        if (!this._grid.grid.cells[y + 1][cell.column].isPassable) {
          highestPlacementRow = Math.min(
            y + (lowestBlockRow - cell.row),
            highestPlacementRow
          );
          continue;
        }
      }
    }
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
          0.33,
          block.player.color
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

    if (this._allowedActions?.length !== 1) {
      return;
    }

    const key = this._virtualKeyboardControls[this._allowedActions[0]];
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
    );
  }

  private _renderVirtualGestures() {
    if (!this._virtualGestureSprites) {
      return;
    }
    this._virtualGestureSprites.forEach((sprite, i) => {
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
    });
  }
}
