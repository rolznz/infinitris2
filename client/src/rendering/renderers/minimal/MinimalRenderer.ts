import IRenderer from '../../IRenderer';
import * as PIXI from 'pixi.js-legacy';
import Grid from '@core/grid/Grid';
import Block from '@core/block/Block';
import Cell from '@core/grid/cell/Cell';
import ISimulationEventListener from '@core/ISimulationEventListener';
import Simulation from '@core/Simulation';
import Tutorial from 'models/src/Tutorial';
import Camera from '@src/rendering/Camera';

const minCellSize = 32;
interface IRenderableGrid {
  grid: Grid;
  graphics: PIXI.Graphics;
}
interface IRenderableBlock {
  block: Block;
  cells: IRenderableCell[];
}

interface IRenderableCell {
  cell: Cell;
  graphics: PIXI.Graphics;
}

interface IPlayerScore {
  playerId: number;
  text: PIXI.Text;
}

export default class MinimalRenderer
  implements IRenderer, ISimulationEventListener {
  private _grid: IRenderableGrid;
  private _placementHelperShadowContainer: PIXI.Container;
  private _placementHelperShadows: PIXI.Graphics[];
  private _app: PIXI.Application;
  private _world: PIXI.Container;

  private _blocks: { [playerId: number]: IRenderableBlock };
  private _cells: { [cellId: number]: IRenderableCell };
  private _playerScores: IPlayerScore[];

  private _simulation: Simulation;

  private _camera: Camera;
  private _gridWidth: number;
  private _gridHeight: number;
  private _cellSize: number;
  private _scrollY: boolean;
  private _scrollX: boolean;
  private _shadowCount: number;

  constructor() {}

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
    if (!this._scrollX && !this._scrollY) {
      return;
    }
    const visibilityX = this._app.renderer.width * 0.5;
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
      this._world.x = this._camera.x + visibilityX;
    }
    if (this._scrollY) {
      this._world.y = cameraY + visibilityY;
      console.log(this._world.y);
    }

    if (this._scrollX) {
      this._grid.graphics.x = (this._camera.x + visibilityX) % this._cellSize;
      this._wrapObjects(visibilityX);
    }
    if (this._scrollY) {
      this._grid.graphics.y =
        ((cameraY + visibilityY) % this._cellSize) - this._cellSize;
    }
  };

  private _wrapObjects(visibilityX: number) {
    this._placementHelperShadows.forEach((shadow) =>
      this._wrapObject(shadow, visibilityX)
    );
    this._world.children.forEach((child) => {
      if (child === this._placementHelperShadowContainer) {
        return;
      }
      this._wrapObject(child, visibilityX);
    });
  }

  private _wrapObject(child: PIXI.DisplayObject, visibilityX: number) {
    if (child.x + this._cellSize < -this._camera.x - visibilityX) {
      child.x += this._gridWidth;
    } else if (
      child.x + this._cellSize >=
      -this._camera.x + this._gridWidth - visibilityX
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

    this._placementHelperShadowContainer = new PIXI.Container();
    this._world.addChild(this._placementHelperShadowContainer);
    this._placementHelperShadows = [];

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

    this._resize();
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: Block) {
    const renderableBlock: IRenderableBlock = {
      cells: block.cells.map((cell) => ({
        cell,
        graphics: new PIXI.Graphics(),
      })),
      block,
    };
    this._world.addChild(...renderableBlock.cells.map((cell) => cell.graphics));
    this._blocks[block.playerId] = renderableBlock;
    this._renderBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: Block) {
    this._moveBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: Block) {
    this._renderCells(block.cells);
    this._world.removeChild(
      ...this._blocks[block.playerId].cells.map((c) => c.graphics)
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
  }

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {
    this._renderCells([].concat.apply([], this._grid.grid.cells), true);
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

    if (this._grid) {
      this._grid.graphics.clear();

      const gridWidth = this._grid.grid.numColumns * cellSize;
      this._gridWidth = gridWidth;
      const gridHeight = this._grid.grid.numRows * cellSize;
      this._gridHeight = gridHeight;
      this._scrollX = gridWidth > appWidth;
      this._scrollY = gridHeight > appHeight;

      this._shadowCount = this._scrollX
        ? 0
        : Math.ceil(Math.floor(appWidth / gridWidth) / 2);

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

      for (
        let shadowIndex = -this._shadowCount;
        shadowIndex <= this._shadowCount;
        shadowIndex++
      ) {
        this._grid.graphics.lineStyle(
          1,
          0xaaaaaa,
          0.5 / (Math.abs(shadowIndex) * 0.5 + 1)
        );
        for (let r = 0; r < gridRows + 1; r++) {
          this._grid.graphics.moveTo(shadowIndex * gridWidth, r * cellSize);
          this._grid.graphics.lineTo(
            shadowIndex * gridWidth + gridWidth,
            r * cellSize
          );
        }

        for (let c = 0; c < gridColumns + 1; c++) {
          this._grid.graphics.moveTo(shadowIndex * gridWidth + c * cellSize, 0);
          this._grid.graphics.lineTo(
            shadowIndex * gridWidth + c * cellSize,
            gridHeight
          );
        }
      }

      this._renderCells([].concat.apply([], this._grid.grid.cells));

      for (const block of Object.values(this._blocks)) {
        this._renderBlock(block.block);
      }
    }
  };

  private _renderCells(cells: Cell[], force: boolean = false) {
    cells.forEach((cell) => this._renderCell(cell, force));
  }

  private _renderCell = (cell: Cell, force: boolean = false) => {
    if (cell.isEmpty && !force) {
      return;
    }
    const cellIndex = cell.row * this._grid.grid.numColumns + cell.column;
    if (!this._cells[cellIndex]) {
      this._cells[cellIndex] = {
        cell,
        graphics: this._world.addChild(new PIXI.Graphics()),
      };
    }
    const renderableCell: IRenderableCell = this._cells[cellIndex];
    const graphics = renderableCell.graphics;
    graphics.clear();
    if (!cell.isEmpty) {
      const cellSize = this._getClampedCellSize();
      graphics.x = renderableCell.cell.column * cellSize;
      graphics.y = renderableCell.cell.row * cellSize;
      this._renderCellAt(graphics, 0, 0, cell.opacity, 0xaaaaaa);
    }
  };

  private _renderBlock(block: Block) {
    const renderableBlock: IRenderableBlock = this._blocks[block.playerId];

    renderableBlock.cells.forEach((cell) => {
      cell.graphics.clear();
      this._renderCellAt(cell.graphics, 0, 0, block.opacity, 0xff00000);
    });

    this._moveBlock(block);
  }

  private _moveBlock(block: Block) {
    const cellSize = this._getClampedCellSize();
    const renderableBlock: IRenderableBlock = this._blocks[block.playerId];

    for (let i = 0; i < block.cells.length; i++) {
      renderableBlock.cells[i].cell = block.cells[i];
    }

    renderableBlock.cells.forEach((cell) => {
      cell.graphics.x = cell.cell.column * cellSize;
      cell.graphics.y = cell.cell.row * cellSize;
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

  private _renderCellAt(
    graphics: PIXI.Graphics,
    x: number,
    y: number,
    opacity: number,
    color: number,
    shadowIndex: number = 0
  ) {
    const cellSize = this._getClampedCellSize();
    graphics.beginFill(color, Math.min(opacity, 1));
    graphics.drawRect(x, y, cellSize, cellSize);
    if (shadowIndex < this._shadowCount) {
      [-1, 1].forEach((i) =>
        this._renderCellAt(
          graphics,
          x + this._gridWidth * i,
          y,
          opacity * 0.5,
          color,
          shadowIndex + 1
        )
      );
    }
  }

  private _renderBlockPlacementShadow(block: Block) {
    const cellSize = this._getClampedCellSize();
    const lowestCells = block.cells.filter(
      (cell) =>
        !block.cells.find(
          (other) => other.column === cell.column && other.row > cell.row
        )
    );
    this._placementHelperShadows.forEach((shadow) => shadow.clear());
    while (lowestCells.length > this._placementHelperShadows.length) {
      const shadowColumn = new PIXI.Graphics();
      this._placementHelperShadows.push(shadowColumn);
      this._placementHelperShadowContainer.addChild(shadowColumn);
    }

    const lowestBlockRow = lowestCells
      .map((cell) => cell.row)
      .sort((a, b) => b - a)[0];

    let highestPlacementRow = this._grid.grid.numRows - 1;

    for (const cell of lowestCells) {
      for (let y = cell.row + 1; y < highestPlacementRow; y++) {
        if (!this._grid.grid.cells[y + 1][cell.column].isEmpty) {
          highestPlacementRow = Math.min(
            y + (lowestBlockRow - cell.row),
            highestPlacementRow
          );
          continue;
        }
      }
    }

    // render placement helper shadow - NB: this could be done a lot more efficiently by rendering 3 lines,
    // but for now it's easier to reuse the cell rendering code (for shadows)
    lowestCells.forEach((cell, index) => {
      const cellDistanceFromLowestRow = lowestBlockRow - cell.row;
      const shadowGraphics = this._placementHelperShadows[index];
      shadowGraphics.x = cell.column * cellSize;
      for (
        let y = cell.row + 1;
        y <= highestPlacementRow - cellDistanceFromLowestRow;
        y++
      ) {
        this._renderCellAt(
          shadowGraphics,
          0,
          y * cellSize,
          block.opacity * 0.5,
          0xff00000
        );
      }
    });
  }
}
