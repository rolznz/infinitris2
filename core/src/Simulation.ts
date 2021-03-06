import Grid from './grid/Grid';
import Player from './player/Player';
import Block from './block/Block';
import ISimulation from '@models/ISimulation';
import ISimulationEventListener from '@models/ISimulationEventListener';
import ISimulationSettings from '@models/ISimulationSettings';
import IBlock from '@models/IBlock';

/**
 * The length of a single animation frame for the simulation.
 */
export const FRAME_LENGTH: number = 1000 / 60;

export default class Simulation implements ISimulation {
  private _players: { [playerId: number]: Player };
  private _followingPlayer?: Player;
  private _grid: Grid;
  private _eventListeners: ISimulationEventListener[];
  private _interval?: NodeJS.Timeout;
  private _settings: ISimulationSettings;
  private _runningTime: number;

  constructor(grid: Grid, settings: ISimulationSettings = {}) {
    this._eventListeners = [];
    this._players = {};
    this._runningTime = 0;
    this._grid = grid;
    this._grid.addEventListener(this);
    this._settings = {
      gravityEnabled: true,
      ...settings,
    };
  }

  get grid(): Grid {
    return this._grid;
  }

  get isRunning(): boolean {
    return Boolean(this._interval);
  }

  get players(): Player[] {
    return Object.values(this._players);
  }

  get settings(): ISimulationSettings {
    return this._settings;
  }

  getPlayer(playerId: number) {
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
    if (!this._interval) {
      this._interval = setInterval(this.step, FRAME_LENGTH);
      console.log('Simulation started');
    }
  }

  /**
   * Stop the simulation running.
   */
  stopInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = undefined;
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
  addPlayer(player: Player) {
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
  onBlockWrapped(block: IBlock, wrapIndexChange: number) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockWrapped(block, wrapIndexChange)
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
   * Execute a single simulation frame
   */
  step = () => {
    Object.values(this._players).forEach(this._updatePlayer);
    this._grid.step();
    this._runningTime += FRAME_LENGTH;
    this._eventListeners.forEach((listener) => listener.onSimulationStep(this));
  };

  private _updatePlayer = (player: Player) => {
    player.update(this._grid.cells, this._settings);
  };
}
