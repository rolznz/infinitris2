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
import IGrid, { PartialClearRow } from '@models/IGrid';
import { IGameMode } from '@models/IGameMode';
import { InfinityGameMode } from '@core/gameModes/InfinityGameMode';
import { FpsCounter } from '@core/FpsCounter';
import { GameModeEvent } from '@models/GameModeEvent';
import NetworkPlayer from '@core/player/NetworkPlayer';
import { IRound } from '@models/IRound';
import { WithId } from '@models/WithId';
import { Round } from '@core/simulation/Round';
import { GameModeType } from '@models/GameModeType';
import { RaceGameMode } from '@core/gameModes/RaceGameMode';
import { FallbackCharacter, ICharacter } from '@models/ICharacter';
import { colors } from '@models/colors';
import { stringToHex } from '@models/util/stringToHex';
import { colorDistance } from '@models/util/colorDistance';
import { hexToString } from '@models/util/hexToString';
import Layout, { defaultLayoutSet, LayoutSet } from '@models/Layout';
import { blockLayoutSets } from '@models/blockLayouts/blockLayoutSets';
import AIPlayer from '@core/player/AIPlayer';
import { simpleRandom } from '@models/util/simpleRandom';
import LayoutUtils from '@core/block/layout/LayoutUtils';
import { IRotationSystem, RotationSystem } from '@models/IRotationSystem';
import { InfinitrisRotationSystem } from '@core/block/rotation/infinitrisRotationSystem';
import { BasicRotationSystem } from '@core/block/rotation/BasicRotationSystem';
import { KeyedRandom } from '@core/simulation/KeyedRandom';
import { ColumnConquestGameMode } from '@core/gameModes/ColumnConquestGameMode';
import { ConquestGameMode } from '@core/gameModes/ConquestGameMode';
import { BattleGameMode } from '@core/gameModes/BattleGameMode';
import { wrap, wrappedDistance } from '@core/utils/wrap';
import { GarbageDefenseGameMode } from '@core/gameModes/GarbageDefenseGameMode';
import { EscapeGameMode } from '@core/gameModes/EscapeGameMode/EscapeGameMode';
import { FRAME_LENGTH, IDEAL_FPS } from '@core/simulation/simulationConstants';
import CellType from '@models/CellType';

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
  private _rootSeed: number;
  private _random: KeyedRandom;
  private _isAlive: boolean;
  private _charactersPool: WithId<ICharacter>[];

  constructor(
    grid: Grid,
    settings: SimulationSettings = {},
    isClient = false,
    rootSeed = Math.floor(Math.random() * 21000000),
    charactersPool: WithId<ICharacter>[] = []
  ) {
    this._charactersPool = charactersPool;
    this._isAlive = true;
    this._eventListeners = [];
    this._rootSeed = rootSeed;
    console.log('Simulation root seed: ', rootSeed);
    this._random = new KeyedRandom(rootSeed);
    this._players = {};
    this._runningTime = 0;
    this._frameNumber = 0;
    this._grid = grid;
    this._grid.setRandom(this._random);
    this._grid.addEventListener(this);
    this._settings = {
      gravityEnabled: true,
      instantDrops: true,
      gameModeType: 'infinity',
      ...this._getDefaultGameModeSimulationSettings(
        settings.gameModeType ?? 'infinity'
      ),
      ...settings,
    };
    this._botSeed = this._settings?.botSettings?.seed ?? this._rootSeed;

    this._layoutSet = this._settings.layoutSetId
      ? blockLayoutSets.find((set) => set.id === this._settings.layoutSetId)
      : undefined;

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
  private _getDefaultGameModeSimulationSettings(
    gameModeType: GameModeType
  ): SimulationSettings {
    switch (gameModeType) {
      case 'escape':
        return {
          saveSpawnPositionOnDeath: false,
        };
    }
    return {};
  }

  onSimulationInit(): void {
    throw new Error('should never be called');
  }
  onSimulationPreStep(): void {
    throw new Error('should never be called');
  }
  onSimulationStep(): void {
    throw new Error('should never be called');
  }

  destroy() {
    this.stopInterval();
    for (const player of this.players) {
      this.removePlayer(player.id);
    }
    this._eventListeners.length = 0;
    this._isAlive = false;
  }

  get rootSeed(): number {
    return this._rootSeed;
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

  get activePlayers(): IPlayer[] {
    return this.players.filter(
      (player) => player.status === PlayerStatus.ingame
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
    return (
      !!this._round &&
      (this._round.isWaitingForNextRound ||
        this._gameMode.shouldNewPlayerSpectate)
    );
  }

  // TODO: move to SimulationSettings, remove reliance on simulation
  get forgivingPlacementFrames(): number {
    return this._settings.forgivingPlacementFrames ?? IDEAL_FPS;
  }

  findFreeSpawnColumn(): number {
    const maxTries = 50;
    let column = 0;
    let found = false;
    let attempts = 0;
    let quality = 0;
    const qualities = [
      [0, -1, 1, -2, 2, -3, 3],
      [0, -1, 1, -2, 2],
      [0, -1, 1],
      [0],
    ];
    for (; quality < qualities.length; quality++) {
      attempts = 0;
      for (; attempts < maxTries; attempts++) {
        column = Math.floor(
          this.nextRandom('randomSpawnColumn') * this._grid.numColumns
        );
        if (
          !this.activePlayers.some((player) =>
            player.block?.cells.some((cell) =>
              qualities[quality].some(
                (i) => wrap(column + i, this._grid.numColumns) === cell.column
              )
            )
          )
        ) {
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    // console.log(
    //   'Chose column: ' +
    //     column +
    //     ' attempts: ' +
    //     attempts +
    //     ' quality: ' +
    //     qualities[quality].join(' ')
    // );
    return column;
  }

  wasRecentlyPlaced(occurrenceFrame: number): boolean {
    return (
      occurrenceFrame !==
        0 /* make sure cannot overwrite cells placed on simulation start */ &&
      this._frameNumber - occurrenceFrame < this.forgivingPlacementFrames
    );
  }

  nextRandom(key: string): number {
    return this._random.next(key);
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
    if (!this._isAlive) {
      throw new Error('Destroyed simulation cannot be restarted');
    }
    if (!this._stepInterval) {
      this._lastStepTime = Date.now();
      // interval set at 1ms and handled in onInterval (iOS low battery forces <= 30fps)
      this._stepInterval = setInterval(this._onInterval, 1);
      console.log('Simulation started');
      this.onSimulationStart();
    }
  }

  /**
   * Stop the simulation running.
   */
  stopInterval() {
    if (this._stepInterval) {
      clearInterval(this._stepInterval);
      this._stepInterval = undefined;
      this.onSimulationStop();
      console.log('Simulation stopped');
    }
  }

  onSimulationStart(): void {
    this._eventListeners.forEach((listener) =>
      listener.onSimulationStart?.(this)
    );
  }
  onSimulationStop(): void {
    this._eventListeners.forEach((listener) =>
      listener.onSimulationStart?.(this)
    );
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
    this.onPlayerCreated(player);
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
      player.destroy();
      this._grid.removePlayer(player);
      delete this._players[playerId];
      //this.onSimulationPlayerRemoved(player);
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
    this._runningTime = 0;
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
    this._checkUnplayableGrid();
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
    this._checkUnplayableGrid();
  }

  /**
   * @inheritdoc
   */
  onBlockPlaced(block: IBlock) {
    this._eventListeners.forEach((listener) => listener.onBlockPlaced?.(block));
    this._checkBridge(block);
    this._grid.checkLineClears(
      block.cells
        .map((cell) => cell.row)
        .filter((row, i, rows) => rows.indexOf(row) === i)
    );
  }

  private _checkBridge(block: IBlock) {
    const bottomCellRow = block.cells.find(
      (cell) => !block.cells.some((other) => other.row > cell.row)
    )!.row;

    const startTime = Date.now();
    for (const cell of block.cells) {
      if (cell.type !== CellType.BridgeCreator || cell.row !== bottomCellRow) {
        continue;
      }
      for (const layer of [1, 4]) {
        for (const direction of [-1, 1, -2, 2, -3, 3]) {
          const areaCell =
            this._grid.cells[
              Math.min(cell.row + layer, this._grid.numRows - 1)
            ][wrap(cell.column + direction, this._grid.numColumns)];
          if (
            areaCell &&
            areaCell.isEmpty &&
            areaCell.type === CellType.BridgeCreator
          ) {
            areaCell.place(block.player);
          }
        }
      }
    }
    // console.log('CheckBridge ' + (Date.now() - startTime) + 'ms');
  }

  /**
   * @inheritdoc
   */
  onBlockRemoved(block: IBlock) {
    this._eventListeners.forEach((listener) =>
      listener.onBlockRemoved?.(block)
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

  addMessage(message: string, player: IPlayer | undefined, isSynced: boolean) {
    console.log('Ingame message', message, player?.nickname, isSynced);
    this._eventListeners.forEach((listener) =>
      listener.onSimulationMessage?.(this, message, player, isSynced)
    );
  }

  onSimulationMessage() {}

  onPlayerKilled(_simulation: ISimulation, victim: IPlayer, attacker: IPlayer) {
    this.addMessage(
      'Player ' + victim.nickname + ' knocked out by ' + attacker.nickname,
      undefined,
      false
    );

    this._eventListeners.forEach((listener) =>
      listener.onPlayerKilled?.(this, victim, attacker)
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
      // this causes the player's cells to change to the default "grass" cell
      // which is problematic for the conquest game mode (it should be captured by the attacker)
      //this._grid.removePlayer(player);
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
  onClearLines(rows: number[], partialClears: PartialClearRow[]) {
    this._eventListeners.forEach((listener) =>
      listener.onClearLines?.(rows, partialClears)
    );
  }
  /**
   * @inheritdoc
   */
  onLinesCleared(rows: number[]): void {
    this._eventListeners.forEach((listener) => listener.onLinesCleared?.(rows));
    this._checkUnplayableGrid();
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

  isTower(row: number): boolean {
    // old dynamic logic no longer used, confusing
    /*const numFilledRows = Math.ceil(
      this._cachedNumNonEmptyCells / this.numColumns
    );*/
    // first 4 rows must never be placeable (to ensure blocks can always be placed)
    //return row < Math.max(this.numRows - numFilledRows - 4, 4);
    return row < this.getTowerRow();
  }
  getTowerRow(): number {
    return this._gameMode.getTowerRow?.() ?? 4;
    /*let towerRow = 0;
    while (towerRow < this.numRows) {
      if (!this.isTower(towerRow)) {
        break;
      }
      ++towerRow;
    }
    return towerRow - 1;*/
  }

  private _createGameMode(gameModeType: GameModeType): IGameMode<unknown> {
    switch (gameModeType) {
      case 'infinity':
        return new InfinityGameMode(this);
      case 'conquest':
        return new ConquestGameMode(this);
      case 'column-conquest':
        return new ColumnConquestGameMode(this);
      case 'garbage-defense':
        return new GarbageDefenseGameMode(this);
      case 'escape':
        return new EscapeGameMode(this);
      case 'battle':
        return new BattleGameMode(this);
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
    this._eventListeners.forEach((listener) =>
      listener.onSimulationPreStep?.(this)
    );
    this.players.forEach(this._updatePlayer);
    this._grid.step(this._isNetworkClient, this._frameNumber);
    this._gameMode.step();
    this._round?.step();
    this._runningTime += FRAME_LENGTH;

    this._eventListeners.forEach((listener) =>
      listener.onSimulationStep?.(this)
    );
  }

  generateCharacter(
    playerId: number,
    isBot: boolean,
    desiredCharacterId?: string
  ): WithId<ICharacter> | FallbackCharacter {
    // example colorDistance #1f645b #15444d 15.327725023522083
    const isCloseColor = (c1: number, c2: number) =>
      c1 === c2 || colorDistance(c1, c2) < 15;
    const freeCharacters = this._charactersPool.filter(
      (character) =>
        !this.players.some(
          (player) =>
            player.characterId === character.id ||
            isCloseColor(player.color, stringToHex(character.color))
        )
    );

    if (freeCharacters.length) {
      return (
        freeCharacters.find(
          (character) =>
            desiredCharacterId && character.id === desiredCharacterId
        ) ||
        freeCharacters[
          Math.floor(this.nextRandom('freeCharacter') * freeCharacters.length)
        ]
      );
    } else {
      let freeColors = colors
        .map((color) => stringToHex(color.hex))
        .filter(
          (color) =>
            !this.players.some((player) => isCloseColor(player.color, color))
        );
      if (!freeColors.length) {
        console.log('No free colors found');
        freeColors = colors.map((color) => stringToHex(color.hex));
      }

      return {
        id: '0',
        color: hexToString(
          freeColors[
            Math.floor(this.nextRandom('freeColor') * freeColors.length)
          ]
        ),
        name: `${isBot ? 'Bot' : 'Player'} ${playerId}`,
      };
    }
  }

  addBot(reactionDelay = 30) {
    const botId = this.getFreePlayerId();
    const botCharacter = this.generateCharacter(botId, true);

    const bot = new AIPlayer(
      this,
      botId,
      this.shouldNewPlayerSpectate
        ? PlayerStatus.knockedOut
        : PlayerStatus.ingame,
      botCharacter.name!,
      stringToHex(botCharacter.color!),
      reactionDelay,
      botCharacter.patternFilename,
      botCharacter.id!.toString()
    );
    this.addPlayer(bot);
  }

  addBots() {
    if (this._settings?.botSettings?.numBots) {
      for (let i = 0; i < this._settings.botSettings.numBots; i++) {
        // find a random bot color - unique until there are more players than colors
        // TODO: move to simulation and notify player of color switch if their color is already in use

        const botId = this.getFreePlayerId();
        const character = this.generateCharacter(botId, true);

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
            character.id
          )
        );
      }
    }
  }
  private _generateBotReactionDelay(): number {
    const random =
      this._botSeed !== undefined
        ? simpleRandom(this._botSeed++)
        : this.nextRandom('generateBotReactionDelay');

    const botDelay =
      (this._settings?.botSettings?.botReactionDelay || 20) +
      Math.floor(
        random * (this._settings?.botSettings?.botRandomReactionDelay || 20)
      );

    console.log('Calculated bot reaction delay: ' + botDelay);
    return botDelay;
  }

  private _updatePlayer = (player: IPlayer) => {
    player.update();
  };

  private _checkUnplayableGrid() {
    if (
      this._isNetworkClient ||
      this._settings.replaceUnplayableBlocks === false
    ) {
      return;
    }
    const playersWithReplacableBlocks = this.nonSpectatorPlayers.filter(
      (player) =>
        player.block &&
        !player.block.isDropping &&
        player.block.isAlive &&
        player.block.hadPlacementAtSpawn
    );
    if (
      playersWithReplacableBlocks.length !== this.nonSpectatorPlayers.length
    ) {
      return;
    }
    const blocksWithPlacements = playersWithReplacableBlocks
      .map((player) => player.block!)
      .filter((block) => block.hasPlacement());
    if (playersWithReplacableBlocks.length && !blocksWithPlacements.length) {
      console.log(
        'No placements: ' +
          playersWithReplacableBlocks
            .map(
              (p) =>
                Object.entries(this.layoutSet.layouts)[p.block!.layoutId][0]
            )
            .join(', ')
      );
      playersWithReplacableBlocks.forEach((player) => {
        player.saveSpawnPosition(player.block!);
        player.removeBlock();
      });
    }
  }
}
