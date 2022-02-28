import Grid from './grid/Grid';
import Player from './player/Player';
import Block from './block/Block';
import ISimulation from '@models/ISimulation';
import ISimulationEventListener from '@models/ISimulationEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import IBlock from '@models/IBlock';
import ICellBehaviour from '@models/ICellBehaviour';
import ICell from '@models/ICell';
import { IPlayer } from '@models/IPlayer';
import IGrid from '@models/IGrid';
import { IGameMode } from '@models/IGameMode';
import { ConquestGameMode } from '@core/gameModes/ConquestGameMode';
import { InfinityGameMode } from '@core/gameModes/InfinityGameMode';
import { FpsCounter } from '@core/FpsCounter';

/**
 * The length of a single animation frame for the simulation.
 */
export const FRAME_LENGTH: number = 1000 / 60;
/**
 * Multiple frames can be executed in one go in order
 * to attempt to run at 60fps
 */
const MAX_CATCHUP_FRAMES = 5;
export const DEFAULT_DAY_LENGTH_SECONDS: number = 10;

export default class Simulation implements ISimulation {
  private _players: { [playerId: number]: IPlayer };
  private _followingPlayer?: IPlayer;
  private _grid: Grid;
  private _eventListeners: ISimulationEventListener[];
  private _stepInterval?: ReturnType<typeof setTimeout>;
  private _settings: SimulationSettings;
  private _runningTime: number;
  private _nextDayTime: number;
  private _dayLengthSeconds: number;
  private _dayNumber: number;
  private _isNetworkClient: boolean;
  private _gameMode: IGameMode<unknown>;
  private _fpsCounter: FpsCounter;
  private _lastStepTime = 0;

  constructor(grid: Grid, settings: SimulationSettings = {}, isClient = false) {
    this._eventListeners = [];
    this._players = {};
    this._runningTime = 0;
    this._grid = grid;
    this._grid.addEventListener(this);
    this._settings = {
      gravityEnabled: true,
      ...settings,
    };
    this._dayNumber = 0;
    this._nextDayTime = 0;
    this._dayLengthSeconds =
      this._settings.dayLengthSeconds || DEFAULT_DAY_LENGTH_SECONDS;
    this._isNetworkClient = isClient;
    this.goToNextDay();
    this._gameMode =
      this._settings.gameModeType === 'conquest'
        ? new ConquestGameMode(this)
        : new InfinityGameMode(this);
    this.addEventListener(this._gameMode);
    this._fpsCounter = new FpsCounter();
  }

  get fps(): number {
    return this._fpsCounter.fps;
  }

  get isNetworkClient(): boolean {
    return this._isNetworkClient;
  }

  get grid(): Grid {
    return this._grid;
  }

  get isRunning(): boolean {
    return Boolean(this._stepInterval);
  }

  get players(): IPlayer[] {
    return Object.values(this._players);
  }

  get settings(): SimulationSettings {
    return this._settings;
  }

  get secondsUntilNextDay() {
    return Math.max(this._nextDayTime - Date.now(), 0) / 1000;
  }

  get dayProportion(): number {
    return 1 - this.secondsUntilNextDay / this._dayLengthSeconds;
  }

  get dayNumber() {
    return this._dayNumber;
  }
  get dayLengthSeconds() {
    return this._dayLengthSeconds;
  }
  set dayNumber(dayNumber: number) {
    this._dayNumber = dayNumber;
  }
  set dayLengthSeconds(dayLengthSeconds: number) {
    this._dayLengthSeconds = dayLengthSeconds;
  }
  set nextDayTime(nextDayTime: number) {
    this._nextDayTime = nextDayTime;
  }

  get gameMode(): IGameMode<unknown> {
    return this._gameMode;
  }

  get followingPlayer(): IPlayer | undefined {
    return this.players.find((player) => this.isFollowingPlayerId(player.id));
  }

  get shouldNewPlayerSpectate(): boolean {
    return this._settings.gameModeType === 'conquest';
  }

  getFreePlayerId(startFromId: number = 0): number {
    while (true) {
      if (!this.players.some((player) => player.id === startFromId)) {
        break;
      }
      ++startFromId;
    }
    return startFromId;
  }

  getPlayer(playerId: number): IPlayer {
    return this._players[playerId];
  }

  // TODO: move to renderer
  isFollowingPlayerId(playerId: number) {
    return playerId === this._followingPlayer?.id;
  }

  /**
   * Add one or more listeners to listen to events broadcasted by this simulation.
   */
  addEventListener(...eventListeners: ISimulationEventListener[]) {
    this._eventListeners.push(...eventListeners);
  }

  /**
   * Prepares a simulation.
   */
  init() {
    this._eventListeners.forEach((listener) => listener.onSimulationInit(this));
  }

  /**
   * Starts a simulation running at @see FRAME_LENGTH frames per second.
   *
   * @param grid The grid to run the simulation on.
   */
  startInterval() {
    if (!this._stepInterval) {
      this._lastStepTime = Date.now();
      // interval set at 1ms and handled in onInterval (iOS low battery forces <= 30fps)
      this._stepInterval = setInterval(this._onInterval, 1);
      console.log('Simulation started');
    }
  }

  /**
   * Stop the simulation running.
   */
  stopInterval() {
    if (this._stepInterval) {
      clearInterval(this._stepInterval);
      this._stepInterval = undefined;
      console.log('Simulation stopped');
    }
  }

  get runningTime(): number {
    return this._runningTime;
  }

  /**
   * Adds a player to the simulation.
   *
   * Players in the simulation will be processed each frame,
   * allowing the player to spawn blocks.
   *
   * @param player the player to add.
   */
  addPlayer(player: IPlayer) {
    if (this._players[player.id]) {
      throw new Error('Player already exists: ' + player.id);
    }
    this._players[player.id] = player;
  }

  // TODO: move to renderer
  followPlayer(player: Player) {
    this._followingPlayer = player;
  }

  /**
   * Removes a player from the simulation.
   *
   * @param playerId the id of the player to remove.
   */
  removePlayer(playerId: number) {
    const player = this._players[playerId];
    if (player) {
      this._grid.removePlayer(player);
      player.destroy();
      delete this._players[playerId];
    }
  }

  /**
   * Returns a list of ids for all players within the simulation.
   */
  getPlayerIds(): number[] {
    return Object.values(this._players).map((player) => player.id);
  }

  startNextRound(): void {
    this._eventListeners.forEach((listener) =>
      listener.onSimulationNextRound(this)
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
  onBlockDied(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockDied(block));
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
  onBlockDestroyed(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockDestroyed(block)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockPlaced(block));

    const rowsToCheck = block.cells
      .map((cell) => cell.row)
      .filter((row, i, rows) => rows.indexOf(row) === i);

    this.checkLineClears(rowsToCheck);
  }

  /**
   * @inheritdoc
   */
  onPlayerCreated(player: IPlayer) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerCreated(player)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerDestroyed(player: IPlayer) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerDestroyed(player)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerToggleChat(player: IPlayer, cancel: boolean) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerToggleChat(player, cancel)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerToggleSpectating(player: IPlayer) {
    if (player.isSpectating) {
      this._grid.removePlayer(player);
    }
    this._eventListeners.forEach((listener) =>
      listener.onPlayerToggleSpectating(player)
    );
  }

  /**
   * @inheritdoc
   */
  onLineCleared(row: number) {
    this._eventListeners.forEach((listener) => listener.onLineCleared(row));
  }

  /**
   * @inheritdoc
   */
  onGridCollapsed(grid: IGrid): void {
    this._eventListeners.forEach((listener) => listener.onGridCollapsed(grid));
  }

  /**
   * @inheritdoc
   */
  onGridReset(grid: IGrid): void {
    this._eventListeners.forEach((listener) => listener.onGridReset(grid));
  }

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    this._eventListeners.forEach((listener) =>
      listener.onCellBehaviourChanged(cell, previousBehaviour)
    );
  }
  /**
   * @inheritdoc
   */
  onCellIsEmptyChanged(cell: ICell) {
    this._eventListeners.forEach((listener) =>
      listener.onCellIsEmptyChanged(cell)
    );
  }
  /**
   * @inheritdoc
   */
  onCellIsClearingChanged(cell: ICell) {
    this._eventListeners.forEach((listener) =>
      listener.onCellIsClearingChanged(cell)
    );
  }

  onSimulationNextDay() {
    this._eventListeners.forEach((listener) =>
      listener.onSimulationNextDay(this)
    );
  }

  private _onInterval = () => {
    // TODO: rather than looping and executing multiple times to hit 60fps, it would be better to process
    // based on the delta since the last frame (like the renderer/camera is doing)
    const time = Date.now();
    const maxLagTime = time - FRAME_LENGTH * MAX_CATCHUP_FRAMES;
    if (this._lastStepTime < maxLagTime) {
      this._lastStepTime = maxLagTime;
    }
    while (this._lastStepTime < time) {
      this.step();
    }
  };

  /**
   * Execute a single simulation frame
   */
  public step() {
    this._lastStepTime += FRAME_LENGTH;
    this._fpsCounter.step();
    Object.values(this._players).forEach(this._updatePlayer);
    this._grid.step();
    this._gameMode.step();
    this._runningTime += FRAME_LENGTH;
    this._eventListeners.forEach((listener) => listener.onSimulationStep(this));

    if (!this.isNetworkClient && this.secondsUntilNextDay <= 0) {
      this.goToNextDay();
    }
  }

  private _updatePlayer = (player: IPlayer) => {
    player.update(this._grid.cells, this._settings);
  };

  goToNextDay() {
    ++this._dayNumber;
    console.log('Day ' + this._dayNumber);
    this._nextDayTime = Date.now() + this._dayLengthSeconds * 1000;
    this._grid.markCollapse();
    setTimeout(() => {
      if (!this._isNetworkClient) {
        this.executeCollapse();
      }
    }, 1000);

    this.onSimulationNextDay();
  }

  executeCollapse() {
    this._grid.executeCollapse();
    const rowsToClear = [...Array(this._grid.numRows)].map((_, i) => i);
    this.checkLineClears(rowsToClear);
  }

  checkLineClears(rowsToCheck: number[]) {
    const filledRows = rowsToCheck.filter(
      (row) => this._cells[row].findIndex((cell) => cell.isEmpty) < 0
    );

    // FIXME: this has to be networked
    this._grid.markLineClears(rowsToClear);
    if (!this._isNetworkClient) {
      this._nextLineClear = Date.now() + 1000;
      this._rowsToClear = [...this._rowsToClear, filledRows];
      //
    }
  }
  executeLineClears(rowsToClear: number[]) {
    this._grid.executeLineClears(rowsToClear);
  }
}
