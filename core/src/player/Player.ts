import Block, { MAX_SCORE } from '../block/Block';
import Layout from '@models/Layout';
import IBlockEventListener from '@models/IBlockEventListener';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';
import { IPlayerEventListener } from '@models/IPlayerEventListener';
import {
  CustomizableInputAction,
  InputActionWithData,
  RotateActionWithData,
} from '@models/InputAction';

let uniqueBlockId = 0;
export default abstract class Player implements IPlayer, IBlockEventListener {
  private _id: number;
  protected _block?: IBlock;
  private _score: number;
  private _health: number;
  private _lastPlacementColumn: number | undefined;
  private _eventListeners: IPlayerEventListener[]; // TODO: add IPlayerEventListener
  //private _nextLayout?: Layout;
  //private _nextLayoutRotation?: number;
  private _nickname: string;
  private _color: number;
  private _patternFilename?: string;
  private _characterId?: string;
  private _simulation: ISimulation;
  private _nextSpawnTime: number;
  private _isFirstBlock: boolean;
  private _isChatting: boolean;
  private _status: PlayerStatus;
  private _lastStatusChangeTime: number;
  private _spawnLocationCell: ICell | undefined;
  private _checkpointCell: ICell | undefined;
  private _layoutBag: Layout[];
  private _actionsToFire: InputActionWithData[];
  private _firedActions: InputActionWithData[];
  private _isPremium: boolean;
  private _isNicknameVerified: boolean;

  constructor(
    simulation: ISimulation,
    id: number,
    status: PlayerStatus,
    nickname: string = 'New Player',
    color: number = 0xf33821,
    patternFilename?: string,
    characterId?: string,
    isPremium?: boolean,
    isNicknameVerified?: boolean
  ) {
    console.log(
      'Creating player ' + id,
      'character',
      characterId,
      'color',
      color,
      'pattern',
      patternFilename
    );
    this._id = id;
    this._eventListeners = [];
    this._score = 0;
    this._health = 1;
    this._nickname = nickname;
    this._color = color;
    this._simulation = simulation;
    this._nextSpawnTime = 0;
    this._isFirstBlock = true;
    this._status = status;
    this._lastStatusChangeTime = 0;
    this._isChatting = false;
    this._patternFilename = patternFilename;
    this._characterId = characterId;
    this._layoutBag = [];
    this._actionsToFire = [];
    this._firedActions = [];
    this._isPremium = isPremium || false;
    this._isNicknameVerified = isNicknameVerified || false;
    this.addEventListener(simulation);
    this._calculateSpawnDelay();
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
    if (this._score === score) {
      return;
    }
    const oldScore = this._score;
    this._score = score;
    this._eventListeners.forEach((listener) =>
      listener.onPlayerScoreChanged(this, this._score - oldScore)
    );
  }
  get health(): number {
    return this._health;
  }
  set health(health: number) {
    if (this._health === health) {
      return;
    }
    const oldHealth = this._health;
    this._health = health;
    this._eventListeners.forEach((listener) =>
      listener.onPlayerHealthChanged(this, this._health - oldHealth)
    );
  }

  get isBot(): boolean {
    return false;
  }
  get isPremium(): boolean {
    return this._isPremium;
  }
  get isNicknameVerified(): boolean {
    return this._isNicknameVerified;
  }

  get patternFilename(): string | undefined {
    return this._patternFilename;
  }
  set patternFilename(patternFilename: string | undefined) {
    this._patternFilename = patternFilename;
  }

  get characterId(): string | undefined {
    return this._characterId;
  }
  set characterId(characterId: string | undefined) {
    this._characterId = characterId;
  }

  get nickname(): string {
    return this._nickname;
  }

  get color(): number {
    return this._color;
  }
  set color(color: number) {
    this._color = color;
  }

  get estimatedSpawnDelay(): number {
    return Math.max(0, this._nextSpawnTime - Date.now());
  }

  set estimatedSpawnDelay(estimatedSpawnDelay: number) {
    this._nextSpawnTime = Date.now() + estimatedSpawnDelay;
    this._eventListeners.forEach((listener) =>
      listener.onPlayerSpawnDelayChanged(this)
    );
  }

  get firedActions(): InputActionWithData[] {
    return this._firedActions;
  }

  /*set nextLayout(nextLayout: Layout | undefined) {
    this._nextLayout = nextLayout;
  }

  set nextLayoutRotation(nextLayoutRotation: number | undefined) {
    this._nextLayoutRotation = nextLayoutRotation;
  }*/

  set spawnLocationCell(cell: ICell | undefined) {
    this._spawnLocationCell = cell;
  }
  set checkpointCell(cell: ICell | undefined) {
    this._checkpointCell = cell;
  }
  get checkpointCell(): ICell | undefined {
    return this._checkpointCell;
  }

  set status(status: PlayerStatus) {
    this._status = status;
    this._lastStatusChangeTime = Date.now();
    if (this._status === PlayerStatus.spectating) {
      this._score = 0;
    }
    if (this._status !== PlayerStatus.ingame) {
      if (this._status === PlayerStatus.knockedOut && this._block) {
        this._block.die();
      }
      this._health = 0;
      this.removeBlock();
    } else {
      this._isFirstBlock = true;
    }
    this._eventListeners.forEach((listener) =>
      listener.onPlayerChangeStatus(this)
    );
  }
  get status(): PlayerStatus {
    return this._status;
  }

  get lastStatusChangeTime(): number {
    return this._lastStatusChangeTime;
  }

  get isChatting(): boolean {
    return this._isChatting;
  }

  get isControllable(): boolean {
    return false;
  }
  get isNetworked(): boolean {
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
  update() {
    if (
      !this._block &&
      !this._simulation.isNetworkClient &&
      this._status === PlayerStatus.ingame
    ) {
      if (
        this._simulation.isNetworkClient ||
        Date.now() < this._nextSpawnTime
      ) {
        return;
      }

      const validLayouts = this._isFirstBlock
        ? this._simulation.safeLayouts
        : this._simulation.allLayouts;

      let lastAttemptedBlock: IBlock | undefined;

      // first try to get a block that can actually be placed
      // iteration 1: check blocks from bag which are placable
      // iteration 2: reset bag, check blocks which are placable
      // iteration 3: if no lines are being cleared and we can't find any blocks that might be placable, fallback to a random block
      const checkPlacementAttempts = this._simulation.grid.nextLinesToClear
        .length
        ? [true, true]
        : [true, true, false];
      for (const checkPlacement of checkPlacementAttempts) {
        // TODO: consider "bag" of layouts rather than pure random
        let layoutsRemaining = this._layoutBag;

        while (layoutsRemaining.length > 0) {
          const layout =
            //this._nextLayout ||
            layoutsRemaining[
              Math.floor(
                this._simulation.nextRandom('nextLayout') *
                  layoutsRemaining.length
              )
            ];

          /*console.log(
            'Trying spawn',
            Object.entries(this._simulation.layoutSet.layouts).find(
              (entry) => entry[1] === layout
            )?.[0],
            'layouts remaining: ' +
              layoutsRemaining.length +
              ' check placement: ' +
              checkPlacement
          );*/
          lastAttemptedBlock = this._tryCreateBlock(layout, checkPlacement);
          if (this._block) {
            /* console.log(
              'Spawn succeeded. Bag size: ' + this._layoutBag.length,
              this._layoutBag
                .map(
                  (l) =>
                    Object.entries(this._simulation.layoutSet.layouts).find(
                      (entry) => entry[1] === l
                    )?.[0]
                )
                .join(', ')
            );*/
            break;
          }
          layoutsRemaining = layoutsRemaining.filter((v) => v !== layout);
        }
        if (this._block) {
          break;
        }
        // reset to check all layouts first
        console.log('Reset bag');
        this._layoutBag = validLayouts.slice();
      }
      if (
        !this._block &&
        lastAttemptedBlock &&
        !this._simulation.grid.nextLinesToClear.length &&
        this._layoutBag.length === validLayouts.length
      ) {
        this.onBlockCreateFailed(lastAttemptedBlock);
      }

      if (this._block) {
        this._layoutBag = this._layoutBag.filter(
          (layout) => layout !== this._block!.layout
        );
      }

      //this._nextLayout = undefined;
      //this._nextLayoutRotation = undefined;
    } else {
      this._block?.update();
    }
    this._fireActions();
  }
  private _tryCreateBlock(layout: Layout, checkPlacement: boolean) {
    const row = this._checkpointCell?.row ?? this._spawnLocationCell?.row ?? 0;
    const column = this._checkpointCell
      ? this._checkpointCell.column
      : this._spawnLocationCell
      ? this._spawnLocationCell.column
      : this._lastPlacementColumn === undefined
      ? this._simulation.settings.randomBlockPlacement !== false
        ? Math.floor(
            this._simulation.nextRandom('randomSpawnColumn') *
              this._simulation.grid.numColumns
          )
        : Math.floor((this._simulation.grid.numColumns - layout[0].length) / 2)
      : this._lastPlacementColumn;

    return this.createBlock(
      ++uniqueBlockId,
      row,
      column,
      0,
      Object.values(this._simulation.layoutSet.layouts).indexOf(layout),
      false,
      checkPlacement
    );
  }

  createBlock(
    blockId: number,
    row: number,
    column: number,
    rotation: number,
    layoutIndex: number,
    force = false,
    checkPlacement = false
  ): IBlock {
    const layouts = Object.values(this._simulation.layoutSet.layouts);
    const newBlock = new Block(
      blockId,
      this,
      layoutIndex,
      layouts[layoutIndex],
      row,
      column,
      rotation,
      this._simulation,
      this,
      force,
      checkPlacement
    );
    /*console.log(
      'Block created for player ' + this._id,
      newBlock.id,
      newBlock.isAlive
    );*/
    if (newBlock.isAlive) {
      this._block = newBlock;
      this._isFirstBlock = false;
      this.onBlockCreated(this._block);
    }
    return newBlock;
  }

  destroy() {
    console.log('Destroying player ' + this._id);
    this.removeBlock();
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
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockMoved(block, dx, dy, dr)
    );
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

    //const isMistake = checkMistake(block.cells, this._simulation);

    //console.log(`${this._nickname} Mistake detected: `, isMistake);
    this._modifyScoreFromBlockPlacement(block, false);

    this._eventListeners.forEach((listener) => listener.onBlockPlaced(block));
    this.removeBlock();
    this._spawnLocationCell = undefined;
    this.saveSpawnPosition(block);
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._modifyScoreFromBlockPlacement(block, true);
    this._eventListeners.forEach((listener) => listener.onBlockDied(block));
    this.removeBlock();
    if (this._simulation.settings.saveSpawnPositionOnDeath !== false) {
      this.saveSpawnPosition(block);
    }
  }

  saveSpawnPosition(block: IBlock) {
    this._lastPlacementColumn = block.column;
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
    // TODO: find a better way to manage different reward types - simulation settings?
    if (this._simulation.settings.gameModeType === 'conquest') {
      return;
    }
    this._score += numRowsCleared;
  }

  removeBlock() {
    this._calculateSpawnDelay();
    this._block?.destroy();
    this._block = undefined;
  }

  private _calculateSpawnDelay() {
    if (this._simulation.isNetworkClient) {
      return;
    }
    if (
      this._simulation.settings.calculateSpawnDelays !== false &&
      this._simulation.settings.gameModeType === 'infinity'
    ) {
      const highestPlayerScore = Math.max(
        ...this._simulation.players.map((player) => player.score)
      );

      // apply a grace period to the score, to stop players who make a mistake at the start of the game from being unfairly penalized
      const scoreGraceAmount =
        this._simulation.settings.spawnDelayScoreGraceAmount ?? 250;
      const getScoreWithGrace = (score: number) =>
        Math.min(
          Math.max(score - scoreGraceAmount, 0),
          this._simulation.settings.spawnDelayMaxScore ?? 1000
        );

      const scoreDiffWithGrace =
        getScoreWithGrace(highestPlayerScore) - getScoreWithGrace(this._score);
      this.estimatedSpawnDelay =
        (scoreDiffWithGrace *
          ((this._simulation.settings.maxSpawnDelaySeconds ?? 5) * 1000)) /
        MAX_SCORE;
    } else {
      //this.estimatedSpawnDelay = 0;
    }
  }

  private _modifyScoreFromBlockPlacement(block: IBlock, isMistake: boolean) {
    // TODO: find a better way to manage different reward types - simulation settings?
    if (this._simulation.settings.gameModeType === 'conquest') {
      return;
    }
    if (isMistake && this._simulation.settings.mistakeDetection !== false) {
      this.score = Math.max(0, Math.floor(this._score * 0.75) - 1);
    } else {
      this.score += Math.floor(
        Math.pow(
          block.cells
            .map((cell) => cell.row / this._simulation.grid.numRows)
            .reduce((prev, next) => prev + next),
          3
        )
      );
    }
  }

  fireActionNextFrame(action: InputActionWithData): void {
    this._actionsToFire.push(action);
  }
  private _fireActions() {
    if (this._block) {
      for (const action of this._actionsToFire) {
        this._fireAction(action);
      }
    }
    this._firedActions = this._actionsToFire.slice();
    this._actionsToFire.length = 0;
  }
  private _fireAction(action: InputActionWithData) {
    const block = this._block;
    switch (action.type) {
      case CustomizableInputAction.MoveLeft:
      case CustomizableInputAction.MoveRight:
      case CustomizableInputAction.MoveDown:
        block?.move(
          action.type === CustomizableInputAction.MoveLeft
            ? -1
            : action.type === CustomizableInputAction.MoveRight
            ? 1
            : 0,
          action.type === CustomizableInputAction.MoveDown ? 1 : 0,
          0
        );
        break;
      case CustomizableInputAction.Drop:
        block?.drop();
        break;
      case CustomizableInputAction.RotateClockwise:
      case CustomizableInputAction.RotateAnticlockwise:
        block?.move(
          0,
          0,
          action.type === CustomizableInputAction.RotateClockwise ? 1 : -1,
          false,
          (action as RotateActionWithData).data.rotateDown
        );
        break;
    }
  }
}
