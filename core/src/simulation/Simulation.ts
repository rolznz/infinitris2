import Grid from '../grid/Grid';
import Player from '../player/Player';
import Block from '../block/Block';
import ISimulation from '@models/ISimulation';
import ISimulationEventListener from '@models/ISimulationEventListener';
import { SimulationSettings } from '@models/SimulationSettings';
import IBlock from '@models/IBlock';
import ICellBehaviour from '@models/ICellBehaviour';
import ICell from '@models/ICell';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import IGrid from '@models/IGrid';
import { IGameMode } from '@models/IGameMode';
import { ConquestGameMode } from '@core/gameModes/ConquestGameMode';
import { InfinityGameMode } from '@core/gameModes/InfinityGameMode';
import { FpsCounter } from '@core/FpsCounter';
import { GameModeEvent } from '@models/GameModeEvent';
import NetworkPlayer from '@core/player/NetworkPlayer';
import { IRound } from '@models/IRound';
import { Round } from '@core/simulation/Round';
import { GameModeType } from '@models/GameModeType';
import { RaceGameMode } from '@core/gameModes/RaceGameMode';
import { ICharacter } from '@models/ICharacter';
import { colors } from '@models/colors';
import { stringToHex } from '@models/util/stringToHex';
import { hexToString } from '@models/util/hexToString';
import Layout, { defaultLayoutSet, LayoutSet } from '@models/Layout';
import { blockLayoutSets } from '@models/blockLayouts/blockLayoutSets';
import AIPlayer from '@core/player/AIPlayer';
import { simpleRandom } from '@models/util/simpleRandom';
import LayoutUtils from '@core/block/layout/LayoutUtils';
import { IRotationSystem, RotationSystem } from '@models/IRotationSystem';
import { InfinitrisRotationSystem } from '@core/block/rotation/infinitrisRotationSystem';
import { BasicRotationSystem } from '@core/block/rotation/BasicRotationSystem';

/**
 * The length of a single animation frame for the simulation.
 */
export const FRAME_LENGTH: number = 1000 / 60;
/**
 * Multiple frames can be executed in one go in order
 * to attempt to run at 60fps
 */
const MAX_CATCHUP_FRAMES = 5;
export default class Simulation implements ISimulation {
  private _players: { [playerId: number]: IPlayer };
  private _followingPlayer?: IPlayer;
  private _grid: Grid;
  private _eventListeners: Partial<ISimulationEventListener>[];
  private _stepInterval?: ReturnType<typeof setTimeout>;
  private _settings: SimulationSettings;
  private _runningTime: number;
  private _frameNumber: number;
  private _isNetworkClient: boolean;
  private _gameMode: IGameMode<unknown>;
  private _fpsCounter: FpsCounter;
  private _lastStepTime = 0;
  private _round: IRound | undefined;
  private _layoutSet: LayoutSet | undefined;
  private _botSeed: number | undefined;
  private _rotationSystem: IRotationSystem;

  constructor(grid: Grid, settings: SimulationSettings = {}, isClient = false) {
    this._eventListeners = [];
    this._players = {};
    this._runningTime = 0;
    this._frameNumber = 0;
    this._grid = grid;
    this._grid.addEventListener(this);
    this._settings = {
      gravityEnabled: true,
      instantDrops: true,
      gameModeType: 'infinity',
      ...settings,
    };
    this._botSeed = this._settings?.botSettings?.seed;

    this._layoutSet = this._settings.layoutSetId
      ? blockLayoutSets.find((set) => set.id === this._settings.layoutSetId)
      : undefined;
    if (this._settings.gameModeType === 'conquest') {
      this._settings = {
        ...this._settings,
        calculateSpawnDelays: false,
      };
    }

    this._isNetworkClient = isClient;
    this._gameMode = this._createGameMode(
      this._settings.gameModeType || 'infinity'
    );

    this.addEventListener(this._gameMode);
    this._fpsCounter = new FpsCounter();
    this._rotationSystem = this._createRotationSystem(
      this._settings.rotationSystem || 'infinitris'
    );

    if (this._gameMode.hasRounds) {
      this._round = new Round(this);
    }
  }
  private _createGameMode(gameModeType: GameModeType): IGameMode<unknown> {
    switch (gameModeType) {
      case 'infinity':
        return new InfinityGameMode(this);
      case 'conquest':
        return new ConquestGameMode(this);
      case 'race':
        return new RaceGameMode(this);
      default:
        throw new Error('Unknown game mode: ' + gameModeType);
    }
  }

  private _createRotationSystem(
    rotationSystem: RotationSystem
  ): IRotationSystem {
    switch (rotationSystem) {
      case 'infinitris':
        return new InfinitrisRotationSystem();
      case 'basic':
        return new BasicRotationSystem();
      default:
        throw new Error('Unknown rotation system: ' + rotationSystem);
    }
  }
  onSimulationInit(): void {
    throw new Error('should never be called');
  }
  onSimulationStep(): void {
    throw new Error('should never be called');
  }

  get frameNumber(): number {
    return this._frameNumber;
  }

  get rotationSystem(): IRotationSystem {
    return this._rotationSystem;
  }

  get layoutSet(): LayoutSet {
    return this._layoutSet || defaultLayoutSet;
  }

  get allLayouts(): Layout[] {
    // TODO: cache
    return Object.entries(this.layoutSet.layouts)
      .filter(
        (entry) =>
          !this._settings.allowedBlockLayoutIds ||
          this._settings.allowedBlockLayoutIds.indexOf(entry[0]) >= 0
      )
      .map((entry) => entry[1]);
  }

  get safeLayouts(): Layout[] {
    // TODO: cache
    const layoutValues = this.allLayouts;
    const safeValues = layoutValues.filter((v) => LayoutUtils.isSafeLayout(v));

    return safeValues.length ? safeValues : layoutValues;
  }

  get isPaused(): boolean {
    return !this._stepInterval;
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

  get networkPlayers(): NetworkPlayer[] {
    return this.players.filter(
      (player) => player.isNetworked
    ) as NetworkPlayer[];
  }

  get nonSpectatorPlayers(): IPlayer[] {
    return this.players.filter(
      (player) => player.status !== PlayerStatus.spectating
    );
  }

  get humanPlayers(): IPlayer[] {
    return this.players.filter((player) => !player.isBot);
  }

  get round(): IRound | undefined {
    return this._round;
  }

  getNetworkPlayerBySocketId(socketId: number): NetworkPlayer | undefined {
    return this.players.find(
      (player) =>
        player.isNetworked && (player as NetworkPlayer).socketId === socketId
    ) as NetworkPlayer | undefined;
  }

  get settings(): SimulationSettings {
    return this._settings;
  }

  get gameMode(): IGameMode<unknown> {
    return this._gameMode;
  }

  get followingPlayer(): IPlayer | undefined {
    return this.players.find((player) => this.isFollowingPlayerId(player.id));
  }

  get controllablePlayer(): IPlayer | undefined {
    return this.players.find((player) => player.isControllable);
  }

  get shouldNewPlayerSpectate(): boolean {
    return !!this._round;
  }

  getFreePlayerId(): number {
    let startFromId = 0;
    while (true) {
      if (!this.players.some((player) => player.id === startFromId)) {
        break;
      }
      ++startFromId;
    }
    return startFromId;
  }

  getPlayer<T extends IPlayer>(playerId: number): T {
    return this._players[playerId] as T;
  }

  isFollowingPlayerId(playerId: number) {
    return playerId === this._followingPlayer?.id;
  }

  /**
   * Add one or more listeners to listen to events broadcasted by this simulation.
   */
  addEventListener(...eventListeners: Partial<ISimulationEventListener>[]) {
    this._eventListeners.push(...eventListeners);
  }

  /**
   * Prepares a simulation.
   */
  init() {
    this._eventListeners.forEach((listener) =>
      listener.onSimulationInit?.(this)
    );
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

  followPlayer(player: IPlayer) {
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

  /**
   * Returns a list of ids for all networked players within the simulation.
   */
  getNetworkPlayerIds(): number[] {
    return Object.values(this.networkPlayers).map((player) => player.id);
  }

  onNextRound(simulation: ISimulation): void {
    this._eventListeners.forEach((listener) => listener.onNextRound?.(this));
  }
  onEndRound(simulation: ISimulation): void {
    this._eventListeners.forEach((listener) => listener.onEndRound?.(this));
  }
  onStartNextRoundTimer(simulation: ISimulation): void {
    this._eventListeners.forEach((listener) =>
      listener.onStartNextRoundTimer?.(this)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockCreated(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockCreated?.(block)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockCreateFailed(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockCreateFailed?.(block)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockMoved(block: IBlock, dx: number, dy: number, dr: number) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockMoved?.(block, dx, dy, dr)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockDied(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockDied?.(block));
  }

  /**
   * @inheritdoc
   */
  onBlockDropped(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockDropped?.(block)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockDestroyed(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockDestroyed?.(block)
    );
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockPlaced?.(block));
    this._grid.checkLineClears(
      block.cells
        .map((cell) => cell.row)
        .filter((row, i, rows) => rows.indexOf(row) === i)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerCreated(player: IPlayer) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerCreated?.(player)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerDestroyed(player: IPlayer) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerDestroyed?.(player)
    );
  }

  onPlayerSpawnDelayChanged(player: IPlayer): void {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerSpawnDelayChanged?.(player)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerToggleChat(player: IPlayer, cancel: boolean) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerToggleChat?.(player, cancel)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerChangeStatus(player: IPlayer) {
    if (player.status !== PlayerStatus.ingame) {
      this._grid.removePlayer(player);
    }
    this._eventListeners.forEach((listener) =>
      listener.onPlayerChangeStatus?.(player)
    );
  }

  /**
   * @inheritdoc
   */
  onPlayerScoreChanged(player: IPlayer, amount: number) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerScoreChanged?.(player, amount)
    );
  }
  /**
   * @inheritdoc
   */
  onPlayerHealthChanged(player: IPlayer, amount: number) {
    this._eventListeners.forEach((listener) =>
      listener.onPlayerHealthChanged?.(player, amount)
    );
  }

  onGameModeEvent(event: GameModeEvent) {
    this._eventListeners.forEach((listener) =>
      listener.onGameModeEvent?.(event)
    );
  }

  /**
   * @inheritdoc
   */
  onClearLines(rows: number[]) {
    this._eventListeners.forEach((listener) => listener.onClearLines?.(rows));
  }
  /**
   * @inheritdoc
   */
  onLinesCleared(rows: number[]): void {
    this._eventListeners.forEach((listener) => listener.onLinesCleared?.(rows));
  }
  /**
   * @inheritdoc
   */
  onLineClearing(row: number) {
    this._eventListeners.forEach((listener) => listener.onLineClearing?.(row));
  }

  /**
   * @inheritdoc
   */
  onLineClear(row: number) {
    this._eventListeners.forEach((listener) => listener.onLineClear?.(row));
  }

  /**
   * @inheritdoc
   */
  onGridReset(grid: IGrid): void {
    this._eventListeners.forEach((listener) => listener.onGridReset?.(grid));
  }

  /**
   * @inheritdoc
   */
  onGridResize(grid: IGrid): void {
    this._eventListeners.forEach((listener) => listener.onGridResize?.(grid));
  }

  /**
   * @inheritdoc
   */
  onCellBehaviourChanged(cell: ICell, previousBehaviour: ICellBehaviour) {
    this._eventListeners.forEach((listener) =>
      listener.onCellBehaviourChanged?.(cell, previousBehaviour)
    );
  }
  /**
   * @inheritdoc
   */
  onCellIsEmptyChanged(cell: ICell) {
    this._eventListeners.forEach((listener) =>
      listener.onCellIsEmptyChanged?.(cell)
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
    ++this._frameNumber;
    this._lastStepTime += FRAME_LENGTH;
    this._fpsCounter.step();
    Object.values(this._players).forEach(this._updatePlayer);
    this._grid.step(this._isNetworkClient);
    this._gameMode.step();
    this._round?.step();
    this._runningTime += FRAME_LENGTH;
    this._eventListeners.forEach((listener) =>
      listener.onSimulationStep?.(this)
    );
  }

  generateCharacter(
    charactersPool: ICharacter[] | undefined,
    playerId: number,
    isBot: boolean,
    desiredCharacterId?: string
  ): Partial<ICharacter> {
    const freeCharacters = charactersPool?.filter(
      (character) =>
        !this.players.some(
          (player) =>
            player.characterId === character.id.toString() ||
            player.color === stringToHex(character.color)
        )
    );

    if (freeCharacters?.length) {
      return (
        freeCharacters.find(
          (character) =>
            desiredCharacterId && character.id.toString() === desiredCharacterId
        ) || freeCharacters[Math.floor(Math.random() * freeCharacters.length)]
      );
    } else {
      let freeColors = colors
        .map((color) => stringToHex(color.hex))
        .filter(
          (color) =>
            this.players.map((player) => player.color).indexOf(color) < 0
        );
      if (!freeColors.length) {
        freeColors = colors.map((color) => stringToHex(color.hex));
      }

      return {
        id: 0,
        color: hexToString(
          freeColors[Math.floor(Math.random() * freeColors.length)]
        ),
        name: `${isBot ? 'Bot' : 'Player'} ${playerId}`,
      };
    }
  }

  addBots(charactersPool: ICharacter[] | undefined) {
    if (this._settings?.botSettings?.numBots) {
      for (let i = 0; i < this._settings.botSettings.numBots; i++) {
        // find a random bot color - unique until there are more players than colors
        // TODO: move to simulation and notify player of color switch if their color is already in use

        const botId = this.getFreePlayerId();
        const character: Partial<ICharacter> = this.generateCharacter(
          charactersPool,
          botId,
          true
        );

        this.addPlayer(
          new AIPlayer(
            this,
            botId,
            this.shouldNewPlayerSpectate
              ? PlayerStatus.knockedOut
              : PlayerStatus.ingame,
            character.name!,
            stringToHex(character.color!),
            this._generateBotReactionDelay(),
            character.patternFilename,
            character.id!.toString()
          )
        );
      }
    }
  }
  private _generateBotReactionDelay(): number {
    const random =
      this._botSeed !== undefined
        ? simpleRandom(this._botSeed++)
        : Math.random();

    const botDelay =
      (this._settings?.botSettings?.botReactionDelay || 20) +
      Math.floor(
        random * (this._settings?.botSettings?.botRandomReactionDelay || 20)
      );

    console.log('Calculated bot reaction delay: ' + botDelay);
    return botDelay;
  }

  private _updatePlayer = (player: IPlayer) => {
    player.update(this._grid.cells, this._settings);
  };
}
