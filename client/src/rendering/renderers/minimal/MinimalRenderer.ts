import IRenderer from '../../IRenderer';
import * as Pixi from 'pixi.js-legacy';
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
  graphics: Pixi.Graphics;
}
interface IRenderableBlock {
  block: Block;
  cells: IRenderableCell[];
}

interface IRenderableCell {
  cell: Cell;
  graphics: Pixi.Graphics;
}

interface IPlayerScore {
  playerId: number;
  text: Pixi.Text;
}

export default class MinimalRenderer
  implements IRenderer, ISimulationEventListener {
  private _grid: IRenderableGrid;
  private _app: Pixi.Application;
  private _world: Pixi.Container;

  private _blocks: { [playerId: number]: IRenderableBlock };
  private _cells: { [cellId: number]: IRenderableCell };
  private _playerScores: IPlayerScore[];

  private _simulation: Simulation;
  private _tutorial: Tutorial;

  private _camera: Camera;
  private _gridWidth: number;
  private _gridHeight: number;
  private _cellSize: number;
  private _scrollY: boolean;
  private _scrollX: boolean;

  constructor(tutorial?: Tutorial) {
    this._tutorial = tutorial;
  }

  /**
   * @inheritdoc
   */
  async create() {
    this._app = new Pixi.Application({
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
      // wrap cells
      this._world.children.forEach((child) => {
        if (child.x + this._cellSize < -this._camera.x - visibilityX) {
          child.x += this._gridWidth;
        } else if (
          child.x + this._cellSize >=
          -this._camera.x + this._gridWidth - visibilityX
        ) {
          child.x -= this._gridWidth;
        }
      });
    }
    if (this._scrollY) {
      this._grid.graphics.y =
        ((cameraY + visibilityY) % this._cellSize) - this._cellSize;
    }
  };

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
      graphics: new Pixi.Graphics(),
    };

    this._app.stage.addChild(this._grid.graphics);
    this._world = new Pixi.Container();
    this._app.stage.addChild(this._world);

    this._playerScores = [...Array(10)].map((_, i) => ({
      playerId: -1,
      text: new Pixi.Text('', {
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
        graphics: new Pixi.Graphics(),
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

      this._camera.gridWidth = gridWidth;

      if (!this._scrollX) {
        this._world.x = this._grid.graphics.x = (appWidth - gridWidth) / 2;
      }
      if (!this._scrollY) {
        this._world.y = this._grid.graphics.y = (appHeight - gridHeight) / 2;
      }

      this._grid.graphics.lineStyle(1, 0xaaaaaa, 0.5);

      const gridRows = this._scrollY
        ? Math.ceil(appHeight / cellSize) + 2
        : this._grid.grid.numRows;
      const gridColumns = this._scrollX
        ? Math.ceil(appWidth / cellSize)
        : this._grid.grid.numColumns;

      for (let r = 0; r < gridRows + 1; r++) {
        this._grid.graphics.moveTo(0, r * cellSize);
        this._grid.graphics.lineTo(gridWidth, r * cellSize);
      }

      for (let c = 0; c < gridColumns + 1; c++) {
        this._grid.graphics.moveTo(c * cellSize, 0);
        this._grid.graphics.lineTo(c * cellSize, gridHeight);
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
        graphics: this._world.addChild(new Pixi.Graphics()),
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
    }
  }

  private _renderCellAt(
    graphics: Pixi.Graphics,
    x: number,
    y: number,
    opacity: number,
    color: number
  ) {
    const cellSize = this._getClampedCellSize();
    graphics.beginFill(color, Math.min(opacity, 1));
    graphics.drawRect(x, y, cellSize, cellSize);
  }
}
