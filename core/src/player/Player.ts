import Block from '../block/Block';
import Cell from '../grid/cell/Cell';
import Layout from '@models/Layout';
import tetrominoes from '@models/Tetrominoes';
import IBlockEventListener from '@models/IBlockEventListener';
import ISimulationSettings from '@models/ISimulationSettings';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';

export default abstract class Player implements IBlockEventListener {
  private _id: number;
  private _block?: IBlock;
  private _score: number;
  private _lastPlacementColumn: number | undefined;
  private _eventListener: IBlockEventListener;
  private _nextLayout?: Layout;
  private _nextLayoutRotation?: number;

  // TODO: addEventListener to be consistent with other objects
  constructor(id: number, eventListener: IBlockEventListener) {
    this._id = id;
    this._eventListener = eventListener;
    this._score = 0;
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

  set nextLayout(nextLayout: Layout | undefined) {
    this._nextLayout = nextLayout;
  }

  set nextLayoutRotation(nextLayoutRotation: number | undefined) {
    this._nextLayoutRotation = nextLayoutRotation;
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
  update(gridCells: ICell[][], simulationSettings: ISimulationSettings) {
    if (!this._block) {
      const layout =
        this._nextLayout ||
        Object.values(tetrominoes)[
          Math.floor(Math.random() * Object.values(tetrominoes).length)
        ];
      this._nextLayout = undefined;
      const column =
        this._lastPlacementColumn === undefined
          ? Math.floor((gridCells[0].length - layout[0].length) / 2)
          : this._lastPlacementColumn;
      this._block = new Block(
        this._id,
        layout,
        simulationSettings.spawnRowOffset || 0,
        column,
        this._nextLayoutRotation || 0,
        gridCells,
        this
      );
      this._nextLayoutRotation = undefined;
    } else {
      this._block.update(gridCells, simulationSettings);
    }
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    this._eventListener.onBlockCreated(block);
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock) {
    this._eventListener.onBlockMoved(block);
  }

  /**
   * @inheritdoc
   */
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {
    this._eventListener.onBlockWrapped(block, wrapIndexChange);
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    if (this._block !== block) {
      throw new Error('Block mismatch');
    }
    this._lastPlacementColumn = this._block.column;
    this._eventListener.onBlockPlaced(block);
    this._removeBlock();

    // TODO: improved score calculation
    this._score += 10;
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._eventListener.onBlockDied(block);
    this._removeBlock();
  }

  private _removeBlock() {
    this._block = undefined;
  }
}
