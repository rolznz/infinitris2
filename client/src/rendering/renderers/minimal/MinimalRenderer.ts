import IRenderer from '../../IRenderer';
import * as PIXI from 'pixi.js-legacy';
import Grid from '@core/grid/Grid';
import ISimulationEventListener from '@models/ISimulationEventListener';
import Simulation from '@core/Simulation';
import Camera from '@src/rendering/Camera';
import CellType from '@models/CellType';
import LaserBehaviour from '@core/grid/cell/behaviours/LaserBehaviour';
import ControlSettings from '@src/input/ControlSettings';
import InputAction from '@models/InputAction';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';

const minCellSize = 32;
interface IRenderableGrid {
  grid: Grid;
  graphics: PIXI.Graphics;
}
interface IRenderableBlock {
  block: IBlock;
  cells: IRenderableCell[];
}

interface IRenderableCell {
  cell: ICell;
  // a cell will be rendered 1 time on wrapped grids, N times for shadow wrapping (grid width < screen width)
  container: PIXI.Container;
  children: {
    shadowIndex: number;
    graphics: PIXI.Graphics;
  }[];
}

interface IPlayerScore {
  playerId: number;
  text: PIXI.Text;
}

export default class MinimalRenderer
  implements IRenderer, ISimulationEventListener {
  // FIXME: restructure to not require definite assignment
  private _grid!: IRenderableGrid;
  private _placementHelperShadowCells!: IRenderableCell[];
  private _virtualKeyboardGraphics?: PIXI.Graphics;
  private _virtualKeyboardCharacters!: PIXI.Text[];
  private _app!: PIXI.Application;
  private _world!: PIXI.Container;

  // FIXME: blocks should have their own ids!
  private _blocks!: { [playerId: number]: IRenderableBlock };
  private _cells!: { [cellId: number]: IRenderableCell };
  private _playerScores!: IPlayerScore[];

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

  constructor() {}

  set virtualKeyboardControls(
    virtualKeyboardControls: ControlSettings | undefined
  ) {
    this._virtualKeyboardControls = virtualKeyboardControls;
  }

  set allowedActions(allowedActions: InputAction[] | undefined) {
    this._allowedActions = allowedActions;
    this._renderVirtualKeyboard();
  }

  /**
   * @inheritdoc
   */
  async create() {
    this._app = new PIXI.Application({
      resizeTo: window,
      antialias: true,
    });
    this._camera = new Camera();
    document.body.appendChild(this._app.view);

    this._blocks = {};
    this._cells = {};

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
      console.log(this._world.y);
    }

    if (this._scrollX) {
      this._grid.graphics.x =
        (this._camera.wrappedX + visibilityX) % this._cellSize;
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
      if (this._hasShadows) {
        this._applyShadowAlpha(cell);
      }

      if (cell.cell.type === CellType.Laser) {
        const cellBehaviour = cell.cell.behaviour as LaserBehaviour;
        cell.container.alpha = cellBehaviour.alpha;
      }
    });
  };

  private _applyShadowAlpha(cell: IRenderableCell) {
    cell.children.forEach((child) => {
      const distance = Math.min(
        Math.abs(cell.container.x + child.graphics.x + this._camera.wrappedX),
        this._app.renderer.width * 0.5
      );

      child.graphics.alpha =
        1 -
        (distance * Math.max(this._shadowCount / 2, 1)) /
          this._app.renderer.width;
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
    this._app.stage.addChild(this._world);

    this._placementHelperShadowCells = [];

    this._playerScores = [...Array(10)].map((_, i) => ({
      playerId: -1,
      text: new PIXI.Text('', {
        font: 'bold italic 60px Arvo',
        fill: '#3e1707',
        align: 'center',
        stroke: '#a4410e',
        strokeThickness: 7,
      }),
    }));

    this._app.stage.addChild(...this._playerScores.map((score) => score.text));

    if (this._virtualKeyboardControls) {
      this._virtualKeyboardGraphics = new PIXI.Graphics();
      this._app.stage.addChild(this._virtualKeyboardGraphics);

      this._virtualKeyboardCharacters = Array.from(
        this._virtualKeyboardControls.values()
      ).map(
        (_) =>
          new PIXI.Text('', {
            font: 'bold italic 60px Arvo',
            fill: '#444444',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 7,
          })
      );
      this._app.stage.addChild(...this._virtualKeyboardCharacters);
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
    };
    this._world.addChild(
      ...renderableBlock.cells.map((cell) => cell.container)
    );
    this._blocks[block.playerId] = renderableBlock;
    this._renderBlock(block);
  }

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
    if (this._simulation.isFollowingPlayerId(block.playerId)) {
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

  private _removeBlock(block: IBlock) {
    this._world.removeChild(
      ...this._blocks[block.playerId].cells.map((cell) => cell.container)
    );
    delete this._blocks[block.playerId];
  }

  /**
   * @inheritdoc
   */
  onSimulationStep() {
    // TODO: only run this once per second
    const scores = this._simulation.players.map((p) => ({
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

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {
    this._renderCells(this._grid.grid.reducedCells);
  }

  private _getCellSize = () => {
    const width = this._app.renderer.width;
    const height = this._app.renderer.height;
    return Math.floor((minCellSize * Math.min(width, height)) / 768 - 3);
  };

  private _getClampedCellSize = () => {
    return Math.max(this._getCellSize(), minCellSize);
  };

  private _resize = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this._camera.reset();

    const appWidth = this._app.renderer.width;
    const appHeight = this._app.renderer.height;
    const cellSize = this._getClampedCellSize();
    this._cellSize = cellSize;

    this._renderVirtualKeyboard();

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
        ? Math.ceil(Math.floor(appWidth / gridWidth) / 2)
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
        ? Math.ceil(appWidth / cellSize)
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

    if (!cell.isEmpty || cell.type === CellType.Laser) {
      const cellSize = this._getClampedCellSize();
      renderableCell.container.x = renderableCell.cell.column * cellSize;
      renderableCell.container.y = renderableCell.cell.row * cellSize;
      this._renderCellCopies(
        renderableCell,
        1,
        cell.type === CellType.Laser ? 0xff0000 : 0xaaaaaa
      );
    } else {
      renderableCell.children.forEach((child) => child.graphics.clear());
    }
  };

  private _renderBlock(block: IBlock) {
    const renderableBlock: IRenderableBlock = this._blocks[block.playerId];
    this._moveBlock(block);

    renderableBlock.cells.forEach((cell) => {
      this._renderCellCopies(cell, 1, block.color);
    });
  }

  private _getVisiblityX() {
    return this._app.renderer.width * 0.5;
  }

  private _moveBlock(block: IBlock) {
    const cellSize = this._getClampedCellSize();
    const renderableBlock: IRenderableBlock = this._blocks[block.playerId];

    for (let i = 0; i < block.cells.length; i++) {
      renderableBlock.cells[i].cell = block.cells[i];
    }

    renderableBlock.cells.forEach((cell) => {
      cell.container.x = cell.cell.column * cellSize;
      cell.container.y = cell.cell.row * cellSize;
    });

    if (this._simulation.isFollowingPlayerId(block.playerId)) {
      const blockX = block.column * cellSize;
      const y = block.row * cellSize;
      this._camera.follow(
        blockX + block.width * cellSize * 0.5,
        y,
        block.playerId
      );

      this._renderBlockPlacementShadow(block);
    }
  }

  private _renderCellCopies(
    cell: IRenderableCell,
    opacity: number,
    color: number,
    shadowIndex: number = 0,
    shadowDirection: number = 0
  ) {
    const shadowIndexWithDirection = shadowIndex * shadowDirection;
    let entry = cell.children.find(
      (child) => child.shadowIndex === shadowIndexWithDirection
    );
    if (!entry) {
      entry = {
        graphics: new PIXI.Graphics(),
        shadowIndex: shadowIndexWithDirection,
      };
      cell.children.push(entry);
      cell.container.addChild(entry.graphics);
    }

    const graphics = entry.graphics;
    graphics.clear();
    const cellSize = this._getClampedCellSize();
    graphics.beginFill(color, Math.min(opacity, 1));
    graphics.drawRect(0, 0, cellSize, cellSize);
    graphics.x = shadowIndexWithDirection * this._gridWidth;
    if (shadowIndex < this._shadowCount) {
      (shadowDirection === 0 ? [-1, 1] : [shadowDirection]).forEach((i) =>
        this._renderCellCopies(
          cell,
          opacity, // * 0.5,
          color,
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
        if (!this._grid.grid.cells[y + 1][cell.column].isEmpty) {
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
        this._renderCellCopies(renderableCell, 0.33, block.color);
        cellIndex++;
      }
    });
  }

  private _getKeySymbol(key: string): string {
    switch (key) {
      case 'ArrowLeft':
        return '←';
      case 'ArrowRight':
        return '→';
      case 'ArrowUp':
        return '↑';
      case 'ArrowDown':
        return '↓';
      default:
        return key;
    }
  }

  private _renderVirtualKeyboardKey(
    inputAction: InputAction,
    column: number,
    row: number,
    left: boolean = false
  ) {
    if (!this._virtualKeyboardControls || !this._virtualKeyboardGraphics) {
      return;
    }
    const key = this._virtualKeyboardControls.get(inputAction);
    const alpha =
      !this._allowedActions ||
      (this._allowedActions.length === 1 &&
        this._allowedActions[0] === inputAction)
        ? 1
        : 0.5;
    const keySize = this._app.renderer.width * 0.05;
    const cols = 3.5;
    const rows = 2.5;
    const keyPadding = keySize * 0.1;

    const x =
      column * keySize + (left ? 0 : this._app.renderer.width - cols * keySize);
    const y = this._app.renderer.height - (rows - row) * keySize;
    const character = this._virtualKeyboardCharacters[inputAction];
    character.text = this._getKeySymbol(key as string);
    character.x = x + keySize * 0.5;
    character.y = y + keySize * 0.5;
    character.anchor.x = 0.5;
    character.anchor.y = 0.5;
    character.alpha = alpha;

    this._virtualKeyboardGraphics.beginFill(0xffffff, alpha);
    this._virtualKeyboardGraphics.drawRect(
      x + keyPadding,
      y + keyPadding,
      keySize - keyPadding * 2,
      keySize - keyPadding * 2
    );
  }

  private _renderVirtualKeyboard() {
    if (!this._virtualKeyboardGraphics) {
      return;
    }
    this._virtualKeyboardGraphics.clear();

    this._renderVirtualKeyboardKey(InputAction.RotateAntiClockwise, 1, 0, true);
    this._renderVirtualKeyboardKey(InputAction.RotateClockwise, 2, 0, true);
    this._renderVirtualKeyboardKey(InputAction.Drop, 1, 0);
    this._renderVirtualKeyboardKey(InputAction.MoveDown, 1, 1);
    this._renderVirtualKeyboardKey(InputAction.MoveLeft, 0, 1);
    this._renderVirtualKeyboardKey(InputAction.MoveRight, 2, 1);
  }
}
