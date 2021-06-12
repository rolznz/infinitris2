import Block from '../block/Block';
import Cell from '../grid/cell/Cell';
import Layout from '@models/Layout';
import tetrominoes from '@models/exampleBlockLayouts/Tetrominoes';
import IBlockEventListener from '@models/IBlockEventListener';
import ISimulationSettings from '@models/ISimulationSettings';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import IPlayer from '@models/IPlayer';

export default abstract class Player implements IPlayer, IBlockEventListener {
  private _id: number;
  private _block?: IBlock;
  private _score: number;
  private _lastPlacementColumn: number | undefined;
  private _eventListeners: IBlockEventListener[]; // TODO: add IPlayerEventListener
  private _nextLayout?: Layout;
  private _nextLayoutRotation?: number;
  private _nickname: string;
  private _color: number;

  constructor(
    id: number,
    nickname: string = 'Guest',
    color: number = 0x888888
  ) {
    this._id = id;
    this._eventListeners = [];
    this._score = 0;
    this._nickname = nickname;
    this._color = color;
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
  update(gridCells: ICell[][], simulationSettings: ISimulationSettings) {
    if (!this._block) {
      const layouts = Object.entries(tetrominoes)
        .filter(
          (entry) =>
            !simulationSettings.allowedBlockLayoutIds ||
            simulationSettings.allowedBlockLayoutIds.indexOf(entry[0]) >= 0
        )
        .map((entry) => entry[1]);

      const layout =
        this._nextLayout || layouts[Math.floor(Math.random() * layouts.length)];
      this._nextLayout = undefined;
      const column =
        this._lastPlacementColumn === undefined
          ? Math.floor((gridCells[0].length - layout[0].length) / 2)
          : this._lastPlacementColumn;
      const newBlock = new Block(
        this,
        layout,
        0,
        column,
        this._nextLayoutRotation || 0,
        gridCells,
        this
      );
      if (newBlock.isAlive) {
        this._block = newBlock;
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
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockWrapped(block, wrapIndexChange)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    if (this._block !== block) {
      throw new Error('Block mismatch');
    }
    this._lastPlacementColumn = this._block.column;
    this._eventListeners.forEach((listener) => listener.onBlockPlaced(block));
    this._removeBlock();

    // TODO: improved score calculation
    this._score += 10;
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockDied(block));
    this._removeBlock();
  }

  private _removeBlock() {
    this._block = undefined;
  }
}
