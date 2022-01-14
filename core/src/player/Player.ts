import Block from '../block/Block';
import Cell from '../grid/cell/Cell';
import Layout from '@models/Layout';
import tetrominoes from '@models/exampleBlockLayouts/Tetrominoes';
import IBlockEventListener from '@models/IBlockEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { IPlayer } from '@models/IPlayer';
import IGrid from '@models/IGrid';
import ISimulation from '@models/ISimulation';
import { FRAME_LENGTH } from '@core/Simulation';
import { checkMistake } from '@core/block/checkMistake';
import LayoutUtils from '@core/block/layout/LayoutUtils';
import { IPlayerEventListener } from '@models/IPlayerEventListener';

export default abstract class Player implements IPlayer, IBlockEventListener {
  private _id: number;
  protected _block?: IBlock;
  private _score: number;
  private _lastPlacementColumn: number | undefined;
  private _eventListeners: IPlayerEventListener[]; // TODO: add IPlayerEventListener
  private _nextLayout?: Layout;
  private _nextLayoutRotation?: number;
  private _nickname: string;
  private _color: number;
  private _simulation: ISimulation;
  private _nextSpawnTime: number;
  private _isFirstBlock: boolean;
  private _isSpectating: boolean;
  private _isChatting: boolean;

  constructor(
    simulation: ISimulation,
    id: number,
    nickname: string = 'Guest',
    color: number = 0xf33821,
    spectate = false
  ) {
    console.log('Creating player ' + id);
    this._id = id;
    this._eventListeners = [];
    this._score = 0;
    this._nickname = nickname;
    this._color = color;
    this._simulation = simulation;
    this._nextSpawnTime = 0;
    this._isFirstBlock = true;
    this._calculateSpawnDelay();
    this._isSpectating = spectate;
    this._isChatting = false;
    this._eventListeners.forEach((listener) => listener.onPlayerCreated(this));
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
  set score(score: number) {
    this._score = score;
  }

  get nickname(): string {
    return this._nickname;
  }

  get color(): number {
    return this._color;
  }

  get estimatedSpawnDelay(): number {
    return Math.max(0, this._nextSpawnTime - Date.now());
  }

  set estimatedSpawnDelay(estimatedSpawnDelay: number) {
    this._nextSpawnTime = Date.now() + estimatedSpawnDelay;
  }

  set nextLayout(nextLayout: Layout | undefined) {
    this._nextLayout = nextLayout;
  }

  set nextLayoutRotation(nextLayoutRotation: number | undefined) {
    this._nextLayoutRotation = nextLayoutRotation;
  }

  set isSpectating(isSpectating: boolean) {
    this._isSpectating = isSpectating;
  }
  get isSpectating(): boolean {
    return this._isSpectating;
  }

  get isChatting(): boolean {
    return this._isChatting;
  }

  get isHuman(): boolean {
    return false;
  }

  cancelChat() {
    if (this._isChatting) {
      this.toggleChat(true);
    }
  }
  toggleChat(cancel = false) {
    this._isChatting = !this._isChatting && !cancel;
    this.onToggleChat(this, cancel);
  }

  onToggleChat(player: IPlayer, cancel: boolean) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerToggleChat(player, cancel)
    );
  }

  /**
   * Add one or more listeners to listen to events broadcasted by this player.
   */
  addEventListener(...eventListeners: IPlayerEventListener[]) {
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
    if (
      !this._block &&
      !this._simulation.isNetworkClient &&
      !this._isSpectating
    ) {
      if (
        this._simulation.isNetworkClient ||
        Date.now() < this._nextSpawnTime
      ) {
        return;
      }

      const validLayouts = Object.entries(tetrominoes)
        .filter(
          (entry) =>
            (!simulationSettings.allowedBlockLayoutIds ||
              simulationSettings.allowedBlockLayoutIds.indexOf(entry[0]) >=
                0) &&
            (!this._isFirstBlock || LayoutUtils.isSafeLayout(entry[1]))
        )
        .map((entry) => entry[1]);

      const layout =
        this._nextLayout ||
        validLayouts[Math.floor(Math.random() * validLayouts.length)];

      this._nextLayout = undefined;
      this._nextLayoutRotation = undefined;
      const column =
        this._lastPlacementColumn === undefined
          ? simulationSettings.randomBlockPlacement !== false
            ? Math.floor(Math.random() * gridCells[0].length)
            : Math.floor((gridCells[0].length - layout[0].length) / 2)
          : this._lastPlacementColumn;

      this.createBlock(
        0,
        column,
        this._nextLayoutRotation || 0,
        Object.values(tetrominoes).indexOf(layout)
      );
    } else {
      this._block?.update();
    }
  }

  createBlock(
    row: number,
    column: number,
    rotation: number,
    layoutIndex: number
  ) {
    const layouts = Object.values(tetrominoes);
    const newBlock = new Block(
      this,
      layoutIndex,
      layouts[layoutIndex],
      row,
      column,
      rotation,
      this._simulation,
      this
    );
    console.log('Block created for player ' + this._id, newBlock.isAlive);
    if (newBlock.isAlive) {
      this._block = newBlock;
      this._isFirstBlock = false;
    }
  }

  destroy() {
    console.log('Destroying player ' + this._id);
    this._removeBlock();
    this._eventListeners.forEach((listener) =>
      listener.onPlayerDestroyed(this)
    );
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
  onBlockDropped(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockDropped(block));
  }

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

  /**
   * @inheritdoc
   */
  onBlockDestroyed(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockDestroyed(block)
    );
  }

  onLineClearCellReward(numRowsCleared: number) {
    this._score += numRowsCleared;
  }

  private _removeBlock() {
    this._calculateSpawnDelay();
    this._block?.destroy();
    this._block = undefined;
  }

  private _calculateSpawnDelay() {
    if (this._simulation.isNetworkClient) {
      return;
    }
    if (this._simulation.settings.calculateSpawnDelays !== false) {
      const highestPlayerScore = Math.max(
        ...this._simulation.players.map((player) => player.score)
      );
      const scoreProportion =
        highestPlayerScore > 0 ? this._score / highestPlayerScore : 1;

      const adjustedScoreProportion = Math.pow(scoreProportion, 0.5);
      this._nextSpawnTime =
        Date.now() + Math.floor((1 - adjustedScoreProportion) * (7 * 1000));
    } else {
      this._nextSpawnTime = 0;
    }
  }

  private _modifyScoreFromBlockPlacement(block: IBlock, isMistake: boolean) {
    if (isMistake && this._simulation.settings.mistakeDetection !== false) {
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
