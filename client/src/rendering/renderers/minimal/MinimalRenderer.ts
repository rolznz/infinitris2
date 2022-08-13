import { ParticleType } from '../../../../../models/src/IRenderer';
import * as PIXI from 'pixi.js-legacy';
import Grid from '@core/grid/Grid';
import CellType from '@models/CellType';
import InputAction, { InputActionWithData } from '@models/InputAction';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { imagesDirectory } from '..';
import ControlSettings from '@models/ControlSettings';
import { InputMethod } from '@models/InputMethod';
import ICellBehaviour from '@models/ICellBehaviour';
import IGrid from '@models/IGrid';
import { IPlayer } from '@models/IPlayer';
import { GridLines } from '@src/rendering/renderers/infinitris2/GridLines';
import { BaseRenderer } from '@src/rendering/BaseRenderer';
import ISimulation from '@models/ISimulation';
import { IRenderableEntity } from '@src/rendering/IRenderableEntity';
import { ClientApiConfig } from '@models/IClientApi';
import { GameModeEvent } from '@models/GameModeEvent';
import { renderCellBehaviour } from '@src/rendering/renderers/minimal/renderCellBehaviour';
import { GridFloor } from '../infinitris2/GridFloor';

const minCellSize = 32;
const particleDivisions = 4;
interface IRenderableGrid {
  grid: Grid;
  graphics: PIXI.Graphics;
}
interface IRenderableBlock {
  block: IBlock;
  cells: IRenderableCell[];
  playerNameText: IRenderableEntity<PIXI.Text>;
}

enum RenderCellType {
  Block,
  Cell,
  PlacementHelper,
}

interface IRenderableCell extends IRenderableEntity<PIXI.Graphics> {
  cell: ICell;
  // a cell will be rendered 1 time on wrapped grids, N times for shadow wrapping (grid width < screen width)
}

/*interface IPlayerScore {
  playerId: number;
  text: PIXI.Text;
}*/

interface IParticle extends IRenderableEntity<PIXI.Graphics> {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export default class MinimalRenderer extends BaseRenderer {
  // FIXME: restructure to not require definite assignment
  private _placementHelperShadowCells!: IRenderableCell[];

  private _shadowGradientGraphics?: PIXI.Graphics;

  // FIXME: blocks should have their own ids!
  private _blocks!: { [playerId: number]: IRenderableBlock };
  private _cells!: { [cellId: number]: IRenderableCell };
  private _particles!: IParticle[];
  private _showNicknames: boolean;
  private _gridFloor!: GridFloor;
  //private _playerScores!: IPlayerScore[];

  private _gridLines!: GridLines;

  constructor(clientApiConfig: ClientApiConfig, showNicknames = true) {
    super(clientApiConfig, 0x333333);
    this._showNicknames = showNicknames;
  }

  /**
   * @inheritdoc
   */
  async create() {
    document.body.appendChild(this._app.view);
  }

  tick() {
    if (!this._simulation) {
      return;
    }

    super.tick();

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
      if (!this._hasShadows) {
        this.wrapObjects();
      }
      this._gridFloor.update(
        this._camera.x,
        !this._hasScrollY
          ? this._gridLines.y + this._gridHeight
          : this._world.y + this._gridHeight
      );
    }

    // FIXME: use simulation cells (see Infinitris2Renderer)
    Object.values(this._cells).forEach((cell) => {
      if (cell.cell.requiresRerender) {
        this._renderCell(cell.cell);
        cell.cell.requiresRerender = false;
      }
      cell.container.alpha = cell.cell.isEmpty ? cell.cell.behaviour.alpha : 1;
    });
  }

  /**
   * @inheritdoc
   */
  destroy() {
    if (this._app) {
      this._app.destroy(true);
    }
  }

  /**
   * @inheritdoc
   */
  onSimulationInit(simulation: ISimulation) {
    super.onSimulationInit(simulation);
    this._blocks = {};
    this._cells = {};
    this._particles = [];
    this._app.stage.removeChildren();

    this._gridLines = new GridLines(simulation, this._app, this._camera);
    this._gridFloor = new GridFloor(this, this._app, 'grass', '0', false);

    this._shadowGradientGraphics = new PIXI.Graphics();

    this._world.removeChildren();
    this._app.stage.addChild(this._world);
    this._gridFloor.createImages();
    this._gridFloor.addChildren();
    this._app.stage.addChild(this._shadowGradientGraphics);

    this._placementHelperShadowCells = [];
  }

  onInputAction = (action: InputActionWithData) => {
    super.onInputAction(action);
    //this._gestureIndicator.onInputAction(action);
  };

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
    };
    this._world.addChild(renderableBlock.playerNameText.container);
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
  onBlockDied(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockDropped(block: IBlock) {}

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._renderCells(block.cells);
  }

  onBlockDestroyed(block: IBlock): void {
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
  onCellIsEmptyChanged(cell: ICell): void {
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

  emitParticle(x: number, y: number, color: number, type: ParticleType) {}

  private _removeBlock(block: IBlock) {
    var renderableBlock = this._blocks[block.player.id];
    if (!renderableBlock) {
      return;
    }
    this._world.removeChild(
      ...renderableBlock.cells.map((cell) => cell.container)
    );
    this._world.removeChild(renderableBlock.playerNameText.container);
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
    if (followingPlayer && followingPlayer.block) {
      // render block placement shadow on every frame (it's difficult to figure out if lava transitioned to active/inactive, locks changed etc.)
      const cellSize = this._cellSize;
      const block = followingPlayer.block;
      const y = block.row * cellSize;
      const blockX = block.centreX * cellSize;
      this._camera.follow(blockX, y, block.player.id);
      this._renderBlockPlacementShadow(block);
    }

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

  onClearLines() {}
  onLinesCleared(rows: number[]): void {}
  onLineClearing() {}

  /**
   * @inheritdoc
   */
  onLineClear(_row: number) {
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

  onNextRound(): void {}

  onPlayerHealthChanged(player: IPlayer, amount: number): void {}
  onPlayerScoreChanged(player: IPlayer, amount: number): void {}
  onGameModeEvent(event: GameModeEvent): void {}

  /**
   * @inheritdoc
   */
  onGridReset(_grid: IGrid) {
    if (!this._simulation) {
      return;
    }
    // TODO: optimize
    this._renderCells(this._simulation.grid.reducedCells);
  }

  protected _resize = async () => {
    if (!this._simulation) {
      return;
    }
    super._resize();

    this._gridLines.render(
      this._gridWidth,
      this._gridHeight,
      this._cellSize,
      this._cellPadding,
      this._hasScrollX,
      this._hasScrollY
    );
    this._gridFloor.resize(this._floorHeight);

    this._renderCells(this._simulation.grid.reducedCells);

    for (const block of Object.values(this._blocks)) {
      this._renderBlock(block.block);
    }

    this._shadowGradientGraphics?.clear();
    if (this._shadowGradientGraphics && this._hasShadows) {
      // thanks to https://gist.github.com/gre/1650294
      const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      for (let x = 0; x < this._appWidth; x++) {
        this._shadowGradientGraphics.lineStyle(
          1,
          0x00000,
          easeInOutQuad(
            Math.abs(this._appWidth * 0.5 - x) / (this._appWidth * 0.5)
          )
        );
        this._shadowGradientGraphics.moveTo(x, 0);
        this._shadowGradientGraphics.lineTo(x, this._appHeight);
      }
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
      this._cells[cellIndex] = {
        cell,
        container: this._world.addChild(new PIXI.Container()),
        children: [],
      };
    }
    const renderableCell: IRenderableCell = this._cells[cellIndex];

    if (!cell.isEmpty || cell.behaviour.type !== CellType.Normal) {
      const cellSize = this._cellSize;
      // FIXME: need to wrap here (see Infinitris 2 renderer)
      renderableCell.container.x = this.getWrappedX(
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
      renderableCell.children.forEach((child) =>
        child.renderableObject.clear()
      );
    }
  };

  private _renderBlock(block: IBlock) {
    const renderableBlock: IRenderableBlock = this._blocks[block.player.id];
    this._moveBlock(block);

    renderableBlock.cells.forEach((cell) => {
      this._renderCellCopies(cell, RenderCellType.Block, 1, block.player.color);
    });

    if (this._showNicknames) {
      this.renderCopies(
        renderableBlock.playerNameText,
        1,
        () => {},
        () => {
          const text = new PIXI.Text(block.player.nickname, {
            font: 'bold italic 60px Arvo',
            fill: PIXI.utils.hex2string(block.player.color),
            align: 'center',
            stroke: '#000000',
            strokeThickness: 7,
          });
          text.anchor.set(0.5, 0);
          renderableBlock.playerNameText.container.addChild(text);
          return text;
        }
      );
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
    const textY = block.row * cellSize - cellSize * 1.2;
    renderableBlock.playerNameText.container.x = textCentreX;
    renderableBlock.playerNameText.container.y = textY;
  }

  private _renderParticle(particle: IParticle, color: number) {
    const particleSize = this._cellSize / particleDivisions;
    this.renderCopies(
      particle,
      1,
      (graphics) => {
        graphics.clear();
        graphics.beginFill(color);
        graphics.drawRect(0, 0, particleSize, particleSize);
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
    opacity: number,
    color: number
  ) {
    this.renderCopies(
      renderableCell,
      opacity,
      (graphics: PIXI.Graphics) => {
        graphics.clear();
        if (renderableCell.cell.behaviour.type !== CellType.Normal) {
          renderCellBehaviour(
            renderableCell.cell.behaviour,
            renderableCell.cell.isEmpty,
            graphics,
            this._cellSize,
            false
          );
        }

        const cellSize = this._cellSize;
        // TODO: extract rendering of different behaviours
        if (renderCellType !== RenderCellType.Cell) {
          graphics.beginFill(color, Math.min(opacity, 1));
          graphics.drawRect(0, 0, cellSize, cellSize);
        } else if (!renderableCell.cell.isEmpty) {
          graphics.beginFill(renderableCell.cell.color, Math.min(opacity, 1));
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

    const lowestBlockRow = lowestCells
      .map((cell) => cell.row)
      .sort((a, b) => b - a)[0];

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
}
