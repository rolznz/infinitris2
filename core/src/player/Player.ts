import Block from '../block/Block';
import Cell from '../grid/cell/Cell';
import Layout from '@models/Layout';
import tetrominoes from '@models/exampleBlockLayouts/Tetrominoes';
import IBlockEventListener from '@models/IBlockEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import IPlayer from '@models/IPlayer';
import IGrid from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import { FRAME_LENGTH } from '@core/Simulation';
import { checkMistake } from '@core/block/checkMistake';
import LayoutUtils from '@core/block/layout/LayoutUtils';

export default abstract class Player implements IPlayer, IBlockEventListener {
  private _id: number;
  protected _block?: IBlock;
  private _score: number;
  private _lastPlacementColumn: number | undefined;
  private _eventListeners: IBlockEventListener[]; // TODO: add IPlayerEventListener
  private _nextLayout?: Layout;
  private _nextLayoutRotation?: number;
  private _nickname: string;
  private _color: number;
  private _simulation: ISimulation;
  private _nextSpawn: number;
  private _estimatedSpawnDelay: number;
  private _isFirstBlock: boolean;

  constructor(
    simulation: ISimulation,
    id: number,
    nickname: string = 'Guest',
    color: number = 0xf33821
  ) {
    this._id = id;
    this._eventListeners = [];
    this._score = 0;
    this._nickname = nickname;
    this._color = color;
    this._simulation = simulation;
    this._nextSpawn = 0;
    this._estimatedSpawnDelay = 0;
    this._isFirstBlock = true;
  }

  get id(): number {
    return this._id;
  }
  get block(): IBlock | undefined {
    return this._block;
  }

  get score(): number {
    return this._score;
  }

  get nickname(): string {
    return this._nickname;
  }

  get color(): number {
    return this._color;
  }

  get estimatedSpawnDelay(): number {
    return this._estimatedSpawnDelay;
  }

  set nextLayout(nextLayout: Layout | undefined) {
    this._nextLayout = nextLayout;
  }

  set nextLayoutRotation(nextLayoutRotation: number | undefined) {
    this._nextLayoutRotation = nextLayoutRotation;
  }

  /**
   * Add one or more listeners to listen to events broadcasted by this player.
   */
  addEventListener(...eventListeners: IBlockEventListener[]) {
    this._eventListeners.push(...eventListeners);
  }

  /**
   * Update a player.
   *
   * If the player doesn't have a block (Because they just spawned or placed one),
   * create a new block.
   *
   * Otherwise, update the player's block.
   *
   * @param gridCells The cells within the grid.
   */
  update(gridCells: ICell[][], simulationSettings: SimulationSettings) {
    if (!this._block) {
      const highestPlayerScore = Math.max(
        ...this._simulation.players.map((player) => player.score)
      );

      const scoreProportion =
        highestPlayerScore > 0 ? this._score / highestPlayerScore : 1;

      const adjustedScoreProportion = Math.pow(scoreProportion, 0.5);
      const delay = (1 - adjustedScoreProportion) * ((7 * 1000) / FRAME_LENGTH); // 7 seconds max
      this._estimatedSpawnDelay = Math.ceil(
        (delay - this._nextSpawn) * FRAME_LENGTH
      );
      if (++this._nextSpawn < delay) {
        return;
      }

      const layouts = Object.entries(tetrominoes)
        .filter(
          (entry) =>
            (!simulationSettings.allowedBlockLayoutIds ||
              simulationSettings.allowedBlockLayoutIds.indexOf(entry[0]) >=
                0) &&
            (!this._isFirstBlock || LayoutUtils.isSafeLayout(entry[1]))
        )
        .map((entry) => entry[1]);

      const layout =
        this._nextLayout || layouts[Math.floor(Math.random() * layouts.length)];

      this._nextLayout = undefined;
      const column =
        this._lastPlacementColumn === undefined
          ? simulationSettings.randomBlockPlacement
            ? Math.floor(Math.random() * gridCells[0].length)
            : Math.floor((gridCells[0].length - layout[0].length) / 2)
          : this._lastPlacementColumn;
      const newBlock = new Block(
        this,
        layout,
        0,
        column,
        this._nextLayoutRotation || 0,
        this._simulation,
        this
      );
      if (newBlock.isAlive) {
        this._block = newBlock;
        this._nextSpawn = 0;
        this._isFirstBlock = false;
      }
      this._nextLayoutRotation = undefined;
    } else {
      this._block.update(gridCells, simulationSettings);
    }
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockCreated(block));
  }

  /**
   * @inheritdoc
   */
  onBlockCreateFailed(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockCreateFailed(block)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockMoved(block));
  }

  /**
   * @inheritdoc
   */
  /*onBlockWrapped(block: IBlock, wrapIndexChange: number) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockWrapped(block, wrapIndexChange)
    );
  }*/

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    if (this._block !== block) {
      throw new Error('Block mismatch');
    }
    this._lastPlacementColumn = this._block.column;

    const isMistake = checkMistake(block.cells, this._simulation);

    //console.log(`${this._nickname} Mistake detected: `, isMistake);
    this._modifyScoreFromBlockPlacement(block, isMistake);

    this._eventListeners.forEach((listener) => listener.onBlockPlaced(block));
    this._removeBlock();
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._modifyScoreFromBlockPlacement(block, true);
    this._eventListeners.forEach((listener) => listener.onBlockDied(block));
    this._removeBlock();
  }

  onLineClearCellReward(numRowsCleared: number) {
    this._score += numRowsCleared;
  }

  private _removeBlock() {
    this._block = undefined;
  }

  private _modifyScoreFromBlockPlacement(block: IBlock, isMistake: boolean) {
    if (isMistake) {
      this._score = Math.max(0, Math.floor(this._score * 0.75) - 1);
    } else {
      this._score += Math.floor(
        Math.pow(
          block.cells
            .map((cell) => cell.row / this._simulation.grid.numRows)
            .reduce((prev, next) => prev + next),
          3
        )
      );
    }
  }
}
