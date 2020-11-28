import IRenderer from '../../IRenderer';
import { Application, Graphics, Sprite } from 'pixi.js-legacy';
import Grid from '@core/grid/Grid';
import Block from '@core/block/Block';
import Cell from '@core/grid/cell/Cell';
import ISimulationEventListener from '@core/ISimulationEventListener';
const imagesDirectory = 'client/images';

interface IRenderableGrid {
  grid: Grid;
  graphics: Graphics;
}
interface IRenderableBlock {
  block: Block;
  graphics: Graphics;
}
interface IRenderableCell {
  cell: Cell;
  graphics: Graphics;
}

export default class MinimalRenderer
  implements IRenderer, ISimulationEventListener {
  private _grid: IRenderableGrid;
  private _app: Application;

  private _blocks: { [playerId: number]: IRenderableBlock };
  private _cells: { [cellId: number]: IRenderableCell };

  /**
   * @inheritdoc
   */
  async create() {
    this._app = new Application({
      resizeTo: window,
    });
    document.body.appendChild(this._app.view);

    this._app.loader.add(`${imagesDirectory}/logo-sm.png`).load(() => {
      //Create the cat sprite
      const cat = new Sprite(
        this._app.loader.resources[`${imagesDirectory}/logo-sm.png`].texture
      );

      //Add the cat to the stage
      this._app.stage.addChild(cat);
    });

    this._blocks = {};
    this._cells = {};

    window.addEventListener('resize', this._resize);
    this._resize();
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
  onSimulationStarted(grid: Grid) {
    this._app.stage.removeChildren();

    this._grid = {
      grid,
      graphics: new Graphics(),
    };

    this._app.stage.addChild(this._grid.graphics);

    this._resize();
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: Block) {
    const renderableBlock: IRenderableBlock = {
      graphics: new Graphics(),
      block,
    };
    this._app.stage.addChild(renderableBlock.graphics);
    this._blocks[block.id] = renderableBlock;
    this._renderBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: Block) {
    this._renderBlock(block);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: Block) {
    this._renderCells(block.cells);
    this._app.stage.removeChild(this._blocks[block.id].graphics);
    delete this._blocks[block.id];
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
    return (36 * Math.min(width, height)) / 768;
  };

  private _resize = () => {
    const width = this._app.renderer.width;
    const height = this._app.renderer.height;
    const cellSize = this._getCellSize();

    if (this._grid) {
      this._grid.graphics.clear();

      const gridWidth = this._grid.grid.numColumns * cellSize;
      const gridHeight = this._grid.grid.numRows * cellSize;

      this._grid.graphics.x = (width - gridWidth) / 2;
      this._grid.graphics.y = (height - gridHeight) / 2;

      this._grid.graphics.lineStyle(1, 0x00ff00);

      for (let r = 0; r < this._grid.grid.numRows + 1; r++) {
        this._grid.graphics.moveTo(0, r * cellSize);
        this._grid.graphics.lineTo(gridWidth, r * cellSize);
      }

      for (let c = 0; c < this._grid.grid.numColumns + 1; c++) {
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
        graphics: this._app.stage.addChild(new Graphics()),
      };
    }
    const renderableCell: IRenderableCell = this._cells[cellIndex];
    const graphics = renderableCell.graphics;
    graphics.clear();
    if (!cell.isEmpty) {
      const cellSize = this._getCellSize();
      graphics.x =
        this._grid.graphics.x + renderableCell.cell.column * cellSize;
      graphics.y = this._grid.graphics.y + renderableCell.cell.row * cellSize;
      this._renderCellAt(graphics, 0, 0, cell.opacity);
    }
  };

  private _renderBlock(block: Block) {
    const renderableBlock: IRenderableBlock = this._blocks[block.id];
    const cellSize = this._getCellSize();
    const graphics = renderableBlock.graphics;
    graphics.clear();
    graphics.x = this._grid.graphics.x + block.column * cellSize;
    graphics.y = this._grid.graphics.y + block.row * cellSize;

    block.cells.forEach((cell) => {
      const cellX = (cell.column - block.column) * cellSize;
      const cellY = (cell.row - block.row) * cellSize;
      this._renderCellAt(graphics, cellX, cellY, block.opacity);
    });
  }

  private _renderCellAt(
    graphics: Graphics,
    x: number,
    y: number,
    opacity: number
  ) {
    const cellSize = this._getCellSize();
    graphics.beginFill(0xff0000, Math.min(opacity, 1));
    graphics.drawRect(x - 1, y - 1, cellSize + 2, cellSize + 2);
  }
}
