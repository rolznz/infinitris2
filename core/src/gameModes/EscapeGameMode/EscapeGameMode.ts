import { INITIAL_FALL_DELAY } from '@core/block/Block';
import { wrap, wrappedDistance } from '@core/utils/wrap';
import { colors } from '@models/colors';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { IGameMode } from '@models/IGameMode';
import { IPlayer, PlayerStatus } from '@models/IPlayer';
import { teams } from '@models/teams';
import ISimulation from '@models/ISimulation';
import { stringToHex } from '@models/util/stringToHex';
import { debounce } from 'ts-debounce';
import { updatePlayerAppearance } from '@core/player/Player';
import { conquestCanPlace } from '@core/gameModes/ConquestGameMode';
import ChallengeCellType from '@models/ChallengeCellType';
import {
  EscapeObstacle,
  createEscapeObstacles,
  RESET_COLUMNS,
} from '@core/gameModes/EscapeGameMode/obstacles/Obstacle';
import createBehaviourFromChallengeCellType from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import CellType from '@models/CellType';
import NormalCellBehaviour from '@core/grid/cell/behaviours/NormalCellBehaviour';
import { EscapeEvent, GameModeEvent } from '@models/GameModeEvent';
import { IDEAL_FPS } from '@core/simulation/simulationConstants';

type EscapeGameModeState = {
  deathLineColumn: number;
  frontDeathLineColumn: number;
  level: number;
};

export type EscapePlacementMode = 'restricted' | 'free';

export class EscapeGameMode implements IGameMode<EscapeGameModeState> {
  private _simulation: ISimulation;
  private _lastMoveWasMistake: { [playerId: number]: boolean };
  private _numMistakes: { [playerId: number]: number };
  private _deathLineColumn: number;
  private _frontDeathLineColumn: number;
  private _nextGenerationColumn: number;
  private _nextObstaclePadding: number;
  private _nextObstacleColumn: number;
  private _obstacle?: EscapeObstacle;
  private _obstacleHistory: EscapeObstacle[];
  private _level: number;
  private _difficulty: number;
  private _escapeObstacles: EscapeObstacle[];
  private _nextFinishLines: { rightColumn: number; numColumns: number }[];
  private _placementMode: EscapePlacementMode;
  private _lastEscapeStepNetworkSync: number;
  private _finishHit: boolean;

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._lastMoveWasMistake = [];
    this._numMistakes = [];
    this._nextFinishLines = [];
    this._deathLineColumn = 0;
    this._frontDeathLineColumn = 0;
    this._nextGenerationColumn = 0;
    this._level = 0;
    this._difficulty = 0;
    this._nextObstacleColumn = 0;
    this._nextObstaclePadding = 0;
    this._obstacleHistory = [];
    this._escapeObstacles = createEscapeObstacles(simulation.grid.numRows);
    this._placementMode = 'restricted';
    this._lastEscapeStepNetworkSync = 0;
    this._finishHit = false;
  }

  get deathLineColumn(): number {
    return this._deathLineColumn;
  }
  get frontDeathLineColumn(): number {
    return this._frontDeathLineColumn;
  }

  get placementMode(): EscapePlacementMode {
    return this._placementMode;
  }

  get hasRounds(): boolean {
    return true;
  }
  get hasHealthbars(): boolean {
    return false;
  }
  get hasLineClearReward(): boolean {
    return true;
  }
  get hasBlockPlacementReward(): boolean {
    return true;
  }
  get shouldNewPlayerSpectate(): boolean {
    return false;
  }
  get level(): number {
    return this._level;
  }
  getMinPlayersForRound(): number {
    return 1;
  }
  getTowerRow(): number {
    return 0;
  }
  allowsSpawnAboveGrid(): boolean {
    return true;
  }

  onGameModeEvent(event: EscapeEvent) {
    // console.log('escape event', event);
    if (event.type === 'escapeStep') {
      if (this._simulation.isNetworkClient) {
        this._deathLineColumn = event.deathLineColumn;
        this._frontDeathLineColumn = event.frontDeathLineColumn;
      }
    } else if (event.type === 'escapeCellGeneration') {
      const cell = this._simulation.grid.cells[event.row][event.column];
      if (event.cellType === undefined) {
        cell.place(undefined);
      } else {
        createBehaviourFromChallengeCellType(
          cell,
          this._simulation.grid,
          event.cellType
        );
      }
    } else if (event.type === 'escapeDeathLineClear') {
      for (let row = 0; row < this._simulation.grid.numRows; row++) {
        this._simulation.grid.cells[row][event.column].reset();
      }
    } else if (event.type === 'escapeFinishLineReached') {
      for (let column = 0; column < event.numColumns; column++) {
        const wrappedColumn = wrap(
          event.start + column,
          this._simulation.grid.numColumns
        );

        for (let row = 0; row < this._simulation.grid.numRows; row++) {
          const cellToReplace = this._simulation.grid.cells[row][wrappedColumn];
          cellToReplace.reset();
        }
      }
      // reset placement type
      this._placementMode = 'restricted';
    }
  }

  step(): void {
    if (this._simulation.round!.isWaitingForNextRound) {
      return;
    }
    const lastDeathLineColumnFloored = Math.floor(this._deathLineColumn);
    let deathLineIncrease = Math.min(0.01 + this._level * 0.000025, 1);
    if (this._level - this._deathLineColumn > 16) {
      deathLineIncrease += 0.01;
    }
    this._deathLineColumn += deathLineIncrease;

    if (this._simulation.isNetworkClient) {
      return;
    }
    const startTime = Date.now();

    if (!this._nextFinishLines.length) {
      this._frontDeathLineColumn =
        lastDeathLineColumnFloored + this._simulation.grid.numColumns - 2;
    } else {
      this._frontDeathLineColumn = this._nextFinishLines[0].rightColumn;
    }

    for (const activePlayer of this._simulation.activePlayers) {
      if (activePlayer.block) {
        const blockFrontColumn =
          Math.ceil(activePlayer.block.centreX) +
          Math.floor(activePlayer.block.width / 2);
        if (
          activePlayer.block &&
          blockFrontColumn === lastDeathLineColumnFloored
        ) {
          activePlayer.block.die();
        }
      }
    }

    this._generateNewColumns();

    if (Math.floor(this._deathLineColumn) !== lastDeathLineColumnFloored) {
      const wrappedLastDeathLineColumn = wrap(
        lastDeathLineColumnFloored,
        this._simulation.grid.numColumns
      );
      this._simulation.onGameModeEvent({
        type: 'escapeDeathLineClear',
        column: wrappedLastDeathLineColumn,
        isSynced: true,
      });

      if (!this._simulation.grid.reducedCells.some((cell) => cell.player)) {
        this._simulation.round!.end(undefined);
      }
    }

    this._checkFinish();

    const processTime = Date.now() - startTime;
    if (processTime > 10) {
      console.error('Long escape step frame: ' + processTime + 'ms');
    }
    if (this._lastEscapeStepNetworkSync-- <= 0) {
      this._lastEscapeStepNetworkSync = IDEAL_FPS;
      this._simulation.onGameModeEvent({
        type: 'escapeStep',
        deathLineColumn: this._deathLineColumn,
        frontDeathLineColumn: this._frontDeathLineColumn,
        isSynced: true,
      });
    }
  }
  private _generateNewColumns() {
    const lastDeathLineColumnFloored = Math.floor(this._deathLineColumn);
    while (
      this._nextGenerationColumn <
      lastDeathLineColumnFloored + this._simulation.grid.numColumns - 1
    ) {
      if (
        wrap(this._nextGenerationColumn, this._simulation.grid.numColumns) ===
        wrap(
          Math.floor(this._deathLineColumn) - 1,
          this._simulation.grid.numColumns
        )
      ) {
        break;
      }
      // generate another obstacle line
      const newObstacleColumn = wrap(
        this._nextGenerationColumn++,
        this._simulation.grid.numColumns
      );
      if (this._nextObstaclePadding-- > 0) {
        continue;
      }

      const rows = this._obstacle?.grid?.[this._nextObstacleColumn++];
      if (rows) {
        for (const rowEntry of rows) {
          const transformedRow =
            rowEntry.row < 0
              ? this._simulation.grid.numRows + rowEntry.row
              : rowEntry.row;

          const cell =
            this._simulation.grid.cells[transformedRow][newObstacleColumn];
          if (cell.isEmpty) {
            this._simulation.onGameModeEvent({
              type: 'escapeCellGeneration',
              isSynced: true,
              row: transformedRow,
              column: newObstacleColumn,
              cellType: rowEntry.type,
            });
          }
        }
      } else {
        if (
          !this._escapeObstacles.some(
            (obstacle) =>
              obstacle.difficulty === this._difficulty &&
              this._obstacleHistory.indexOf(obstacle) < 0
          )
        ) {
          ++this._difficulty;
        }

        // first get obstacles that have never been seen before
        const validObstacles = this._escapeObstacles.filter(
          (obstacle) =>
            obstacle.difficulty <= this._difficulty &&
            this._obstacleHistory.indexOf(obstacle) < 0
        );
        if (!validObstacles.length) {
          // fallback to any obstacle that isn't the same as the current one
          validObstacles.push(
            ...this._escapeObstacles.filter(
              (obstacle) => obstacle !== this._obstacle
            )
          );
        }

        this._obstacle =
          validObstacles[
            Math.floor(
              this._simulation.nextRandom('escape-obstacle') *
                validObstacles.length
            )
          ];
        this._nextObstacleColumn = 0;
        this._nextObstaclePadding = 4;
        this._obstacleHistory.push(this._obstacle);
        if (
          this._obstacle.grid.some((column) =>
            column.some((cell) => cell.type === ChallengeCellType.Finish)
          )
        ) {
          this._nextFinishLines.push({
            rightColumn:
              this._nextGenerationColumn +
              this._nextObstaclePadding +
              this._obstacle.grid.length,
            numColumns: this._obstacle.grid.length,
          });
        }
      }
    }
  }

  onBlockCreated(block: IBlock) {
    this._forceBlockBack(block);
  }

  onBlockMoved(block: IBlock) {
    this._forceBlockBack(block);
  }
  private _forceBlockBack(block: IBlock) {
    // TODO: this should be part of the movement system
    const blockFrontColumn =
      Math.ceil(block.centreX) + Math.floor(block.width / 2);

    let bumpBack = blockFrontColumn - this._frontDeathLineColumn;

    if (bumpBack > 0) {
      block.move(-1, 0, 0, true);
    }
  }

  onBlockDied(block: IBlock) {
    this._lastMoveWasMistake[block.player.id] = true;
    this._numMistakes[block.player.id] =
      (this._numMistakes[block.player.id] || 0) + 1;
    block.player.spawnLocation = { row: 0, column: this._level };
  }
  onBlockPlaced(block: IBlock) {
    for (const cell of block.cells) {
      const cellUnwrappedColumn =
        cell.column +
        Math.floor(block.column / this._simulation.grid.numColumns) *
          this._simulation.grid.numColumns;
      if (cellUnwrappedColumn < Math.floor(this._deathLineColumn)) {
        // don't allow cells to be placed behind the death line
        cell.reset();
      }
    }
    //const startTime = Date.now();
    this._lastMoveWasMistake[block.player.id] = false;
    //const prevLevel = this._level;
    this._level = Math.max(
      this._level,
      Math.ceil(block.centreX) + Math.floor(block.width / 2)
    );
    this._checkPartialClearActivation(block);
    if (!this._simulation.isNetworkClient) {
      // finish check is done after block has been placed, since otherwise receives events in different order (finish, then block placed)
      // which will put the client out of sync
      // TODO: find a more reliable way to do this

      if (block.cells.some((cell) => cell.type === CellType.FinishChallenge)) {
        this._finishHit = true;
      }
    }
  }

  private _checkPartialClearActivation(block: IBlock) {
    if (this._placementMode === 'free') {
      return;
    }
    for (const cell of block.cells) {
      for (const direction of [-1, 1]) {
        if (
          this._simulation.grid.getNeighbour(cell, direction, 0)?.type ===
          CellType.PartialClear
        ) {
          this._placementMode = 'free';
          return;
        }
      }
    }
  }
  private _checkFinish() {
    if (!this._finishHit) {
      return;
    }
    this._finishHit = false;
    if (!this._nextFinishLines.length) {
      return;
    }
    const currentFinishLine = this._nextFinishLines[0];
    const start = Math.floor(
      this._frontDeathLineColumn - currentFinishLine.numColumns
    );

    this._simulation.onGameModeEvent({
      type: 'escapeFinishLineReached',
      start,
      numColumns: currentFinishLine.numColumns,
      isSynced: true,
    });

    // reset spawn delays
    this._numMistakes = [];

    // advance next death line to next finish line location
    this._nextFinishLines.shift();
  }

  onPlayerCreated(player: IPlayer) {
    // make all players share the same color and pattern
    if (!this._simulation.isNetworkClient) {
      const otherPlayers = this._simulation.nonSpectatorPlayers.filter(
        (other) => other !== player
      );
      if (otherPlayers.length) {
        updatePlayerAppearance(player, {
          characterId: player.characterId,
          color: otherPlayers[0].color,
          patternFilename: otherPlayers[0].patternFilename,
        });
      }
    }
    player.spawnLocation = { column: this._level, row: 0 };
  }

  onEndRound() {
    this._simulation.grid.reset();
  }

  onPlayerChangeStatus(player: IPlayer) {
    player.spawnLocation = { column: this._level, row: 0 };
  }

  onNextRound() {
    if (!this._simulation.nonSpectatorPlayers.length) {
      return;
    }
    this._nextFinishLines = [];
    this._lastMoveWasMistake = [];
    this._numMistakes = [];
    this._level = 1;
    this._difficulty = 1;
    this._nextGenerationColumn = 0;
    this._nextObstaclePadding = 4;
    this._obstacleHistory = [];
    this._obstacle = undefined;
    this._placementMode = 'restricted';
    this._lastEscapeStepNetworkSync = 0;
    this._finishHit = false;

    //this._simulation.grid.cells[0].forEach((cell) => cell.place(undefined));

    this._simulation.grid.cells[this._simulation.grid.numRows - 1][0].place(
      this._simulation.nonSpectatorPlayers[0]
    );

    for (const player of this._simulation.nonSpectatorPlayers) {
      player.spawnLocation = { column: this._level, row: 0 };
    }

    this._deathLineColumn = -18;
    this._frontDeathLineColumn = 100;
  }

  serialize(): EscapeGameModeState {
    return {
      level: this._level,
      deathLineColumn: this._deathLineColumn,
      frontDeathLineColumn: this._frontDeathLineColumn,
    };
  }

  deserialize(state: EscapeGameModeState) {
    this._level = state.level;
    this._deathLineColumn = state.deathLineColumn;
    this._frontDeathLineColumn = state.frontDeathLineColumn;
  }

  checkMistake(player: IPlayer, cells: ICell[], isMistake: boolean): boolean {
    if (isMistake) {
      return true;
    }
    if (this._placementMode === 'free') {
      return isMistake;
    }

    isMistake = true;
    for (const cell of cells) {
      if (escapeCanPlace(player, this._simulation, cell)) {
        isMistake = false;
        break;
      }
    }
    return isMistake;
  }

  getSpawnDelay(player: IPlayer) {
    if (this._lastMoveWasMistake[player.id]) {
      return 1000 * this._numMistakes[player.id];
    } else {
      return 0;
    }
  }
}

export function escapeCanPlace(
  player: IPlayer,
  simulation: ISimulation,
  cell: ICell,
  isForgiving = true
): boolean {
  if (
    !cell.isEmpty &&
    (!isForgiving || !simulation.wasRecentlyPlaced(cell.placementFrame))
  ) {
    return false;
  }

  if (cell.type == CellType.Deadly || !cell.behaviour.isPassable) {
    return false;
  }

  let canPlace = false;
  for (const neighbourDirection of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]) {
    const neighbourColumn = wrap(
      cell.column + neighbourDirection[0],
      simulation.grid.numColumns
    );

    const neighbour =
      simulation.grid.cells[cell.row + neighbourDirection[1]]?.[
        neighbourColumn
      ];
    canPlace = neighbour && neighbour.player?.color === player.color;
    if (canPlace) {
      break;
    }
  }

  return canPlace;
}
