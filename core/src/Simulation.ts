import Grid from './grid/Grid';
import Player from './player/Player';
import Block from './block/Block';
import ISimulation from '@models/ISimulation';
import ISimulationEventListener from '@models/ISimulationEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import IBlock from '@models/IBlock';
import ICellBehaviour from '@models/ICellBehaviour';
import ICell from '@models/ICell';
import IPlayer from '@models/IPlayer';
import IGrid from '@models/IGrid';

/**
 * The length of a single animation frame for the simulation.
 */
export const FRAME_LENGTH: number = 1000 / 60;
export const DEFAULT_DAY_LENGTH: number = 2000;

export default class Simulation implements ISimulation {
  private _players: { [playerId: number]: IPlayer };
  private _followingPlayer?: IPlayer;
  private _grid: Grid;
  private _eventListeners: ISimulationEventListener[];
  private _stepInterval?: ReturnType<typeof setTimeout>;
  private _settings: SimulationSettings;
  private _runningTime: number;
  private _nextDay: number;
  private _dayNumber: number;
  private _initialDayLength: number;
  private _nextDayLength: number;

  constructor(grid: Grid, settings: SimulationSettings = {}) {
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
    this._nextDay = 0;
    this._nextDayLength = 0;
    this._initialDayLength = this._settings.dayLength || DEFAULT_DAY_LENGTH;
    this._goToNextDay();
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

  get dayProportion(): number {
    return (this._nextDayLength - this._nextDay) / this._nextDayLength;
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
      this._stepInterval = setInterval(this.step, FRAME_LENGTH);
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
    this._players[player.id] = player;
    player.addEventListener(this);
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
    // TODO: Also delete their block
    delete this._players[playerId];
  }

  /**
   * Returns a list of ids for all players within the simulation.
   */
  getPlayerIds(): number[] {
    return Object.values(this._players).map((player) => player.id);
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
  onBlockDied(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockDied(block));
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockPlaced(block));
    this._grid.checkLineClears(
      block.cells
        .map((cell) => cell.row)
        .filter((row, i, rows) => rows.indexOf(row) === i)
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
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    this._eventListeners.forEach((listener) =>
      listener.onCellBehaviourChanged(cell, previousBehaviour)
    );
  }

  /**
   * Execute a single simulation frame
   */
  step = () => {
    Object.values(this._players).forEach(this._updatePlayer);
    this._grid.step();
    this._runningTime += FRAME_LENGTH;
    this._eventListeners.forEach((listener) => listener.onSimulationStep(this));
    // TODO: consider day speed increasing/decreasing based on number of filled rows (more rows = faster day)
    if (--this._nextDay <= 0) {
      this._goToNextDay();
    }
  };

  private _updatePlayer = (player: IPlayer) => {
    player.update(this._grid.cells, this._settings);
  };

  private _goToNextDay() {
    ++this._dayNumber;
    console.log('Day ' + this._dayNumber);
    this._nextDayLength = Math.floor(
      this._initialDayLength // * this._dayNumber // * 1.05
    );
    this._nextDay = this._nextDayLength;
    this._grid.collapse();
  }
}
