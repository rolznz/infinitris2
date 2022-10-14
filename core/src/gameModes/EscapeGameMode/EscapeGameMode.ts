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

type EscapeGameModeState = {
  deathLineColumn: number;
  level: number;
};

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
  private _nextFinishLineLocations: number[];

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._lastMoveWasMistake = [];
    this._numMistakes = [];
    this._nextFinishLineLocations = [];
    this._deathLineColumn = 0;
    this._frontDeathLineColumn = 0;
    this._nextGenerationColumn = 0;
    this._level = 0;
    this._difficulty = 0;
    this._nextObstacleColumn = 0;
    this._nextObstaclePadding = 0;
    this._obstacleHistory = [];
    this._escapeObstacles = createEscapeObstacles(simulation.grid.numRows);
  }

  get deathLineColumn(): number {
    return this._deathLineColumn;
  }
  get frontDeathLineColumn(): number {
    return this._frontDeathLineColumn;
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

  step(): void {
    if (
      this._simulation.round!.isWaitingForNextRound ||
      this._simulation.isNetworkClient
    ) {
      return;
    }
    const startTime = Date.now();
    const processes: string[] = [];
    const lastDeathLineColumnFloored = Math.floor(this._deathLineColumn);
    // TODO: sync
    let deathLineIncrease = Math.min(0.01 + this._level * 0.000025, 1);
    if (this._level - this._deathLineColumn > 16) {
      deathLineIncrease += 0.01;
    }
    this._deathLineColumn += deathLineIncrease;

    if (!this._nextFinishLineLocations.length) {
      this._frontDeathLineColumn =
        lastDeathLineColumnFloored + this._simulation.grid.numColumns - 2;
    } else {
      this._frontDeathLineColumn = this._nextFinishLineLocations[0];
    }

    for (const activePlayer of this._simulation.activePlayers) {
      if (
        activePlayer.block &&
        activePlayer.block.column === lastDeathLineColumnFloored
      ) {
        activePlayer.block.die();
      }
    }

    this._generateNewColumns();

    // TODO: sync
    if (Math.floor(this._deathLineColumn) !== lastDeathLineColumnFloored) {
      const wrappedLastDeathLineColumn = wrap(
        lastDeathLineColumnFloored,
        this._simulation.grid.numColumns
      );
      for (let row = 0; row < this._simulation.grid.numRows; row++) {
        this._simulation.grid.cells[row][wrappedLastDeathLineColumn].reset();
      }
      if (!this._simulation.grid.reducedCells.some((cell) => cell.player)) {
        this._simulation.round!.end(undefined);
      }
      processes.push('death line advance');
    }

    const processTime = Date.now() - startTime;
    if (processTime > 10) {
      console.error(
        'Long escape step frame: ' + processTime + 'ms: ' + processes.join(', ')
      );
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
      // const obstacleType = Math.floor(this._nextObstacleColumn / 4) % 4;
      // if (obstacleType % 2 === 0) {
      //   continue;
      // }

      // const rows =
      //   obstacleType === 1
      //     ? [...new Array(this._simulation.grid.numRows - 8)].map(
      //         (_, index) => this._simulation.grid.numRows - 1 - index
      //       )
      //     : /*: obstacleType === 2
      //     ? [...new Array(Math.floor(this._simulation.grid.numRows / 4))].map(
      //         (_, index) =>
      //           Math.floor(this._simulation.grid.numRows / 2) + index
      //       )*/
      //       /*[...new Array(this._simulation.grid.numRows - 8)].map(
      //         (_, index) => index
      //       );*/ [
      //         ...new Array(Math.floor(this._simulation.grid.numRows / 2)),
      //       ].map(
      //         (_, index) =>
      //           Math.floor(this._simulation.grid.numRows / 4) + index
      //       );

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
            if (rowEntry.type === undefined) {
              cell.place(undefined);
            } else {
              createBehaviourFromChallengeCellType(
                cell,
                this._simulation.grid,
                rowEntry.type
              );
            }
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
          this._nextFinishLineLocations.push(
            this._nextGenerationColumn +
              this._nextObstaclePadding +
              this._obstacle.grid.length
          );
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

    if (block.row < 0) {
      // don't allow the block to travel on top of the grid unless it's touching a finish cell
      let touchingFinishCell = false;
      for (let i = 0; i < block.width; i++) {
        if (
          this._simulation.grid.cells[0][
            wrap(blockFrontColumn - (i + 1), this._simulation.grid.numColumns)
          ].type === CellType.FinishChallenge
        ) {
          touchingFinishCell = true;
          break;
        }
      }
      if (!touchingFinishCell) {
        bumpBack += RESET_COLUMNS;
      }
    }

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
    const startTime = Date.now();
    this._lastMoveWasMistake[block.player.id] = false;
    const prevLevel = this._level;
    this._level = Math.max(
      this._level,
      Math.ceil(block.centreX) + Math.floor(block.width / 2)
    );
    /*if (this._level > prevLevel) {
      this._simulation.addMessage('Level ' + this._level, undefined, false);
    }*/
    this._checkFinish(block);
    this._checkBridge(block);
    //block.player.spawnLocation = this._getNextSpawnLocation(block.column);
    console.log('onBlockPlaced ' + (Date.now() - startTime) + 'ms');
  }
  private _checkFinish(block: IBlock) {
    if (block.cells.some((cell) => cell.type === CellType.FinishChallenge)) {
      const start = Math.floor(this._frontDeathLineColumn - RESET_COLUMNS);
      for (let column = 0; column < RESET_COLUMNS; column++) {
        const wrappedColumn = wrap(
          start + column,
          this._simulation.grid.numColumns
        );
        for (let row = 0; row < this._simulation.grid.numRows; row++) {
          const cellToReplace = this._simulation.grid.cells[row][wrappedColumn];
          cellToReplace.reset();
        }
      }
      // reset spawn delays
      this._numMistakes = [];

      // advance next death line to next finish line location
      this._nextFinishLineLocations.shift();
    }
  }
  private _checkBridge(block: IBlock) {
    // FIXME: the bridge cell behaviour should handle this!

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
            this._simulation.grid.cells[
              Math.min(cell.row + layer, this._simulation.grid.numRows - 1)
            ][wrap(cell.column + direction, this._simulation.grid.numColumns)];
          if (
            areaCell &&
            areaCell.isEmpty &&
            areaCell.type === CellType.BridgeCreator
          ) {
            areaCell.place(block.player);
          }
        }
      }
      /*const areaSize = 5;
      const areaColumn = Math.round(cell.column / areaSize) * areaSize;
      const areaRow = Math.ceil(cell.row / areaSize) * areaSize;
      for (const area of [
        [-1, 0],
        [1, 0],
        //[0, 1],
      ]) {
        for (let column = 0; column < areaSize; column++) {
          const areaCell =
            this._simulation.grid.cells[areaRow + area[1] * areaSize]?.[
              wrap(
                areaColumn + area[0] * areaSize + column,
                this._simulation.grid.numColumns
              )
            ];
          if (
            areaCell &&
            areaCell.isEmpty &&
            areaCell.type === CellType.BridgeCreator
          ) {
            areaCell.place(block.player);
          }
        }
      }*/
    }
    console.log('CheckBridge ' + (Date.now() - startTime) + 'ms');
  }

  /*onPlayerDestroyed(player: IPlayer) {
    if (this._simulation.isNetworkClient) {
      return;
    }
    // TODO: this is copied from ConquestGameMode. Move to simulation
    // find another player on the same team and give the cells to them instead so that they aren't reset
    const allyPlayer = this._simulation.activePlayers.find(
      (other) => other.color === player.color && other !== player
    );
    if (allyPlayer) {
      const cellsToReplace = this._simulation.grid.reducedCells.filter(
        (cell) => cell.player === player
      );
      this.fillCells(cellsToReplace, allyPlayer);
    }
  }

  fillCells(cellsToFill: ICell[], player: IPlayer) {
    this._simulation.onGameModeEvent({
      type: 'cellsCaptured',
      playerId: player.id,
      cells: cellsToFill.map((cell) => ({
        row: cell.row,
        column: cell.column,
      })),
      isSynced: true,
    });

    const lineClearRowsToCheck: number[] = [];

    for (const cellToFill of cellsToFill) {
      // only re-fire event if color changed
      // (same color is player transfer when someone exits the game)
      if (cellToFill.player?.color !== player.color) {
        this._simulation.onGameModeEvent({
          type: 'cellCaptured',
          column: cellToFill.column,
          row: cellToFill.row,
          color: player.color,
        });
        this._delayRerender(cellToFill);
      }
      cellToFill.place(player);
      lineClearRowsToCheck.push(cellToFill.row);
    }
    this._simulation.grid.checkLineClears(
      lineClearRowsToCheck.filter((row, i, rows) => rows.indexOf(row) === i)
    );
    this._debouncedCalculatePlayerScores();
  }*/

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
    this._nextFinishLineLocations = [];
    this._lastMoveWasMistake = [];
    this._numMistakes = [];
    this._level = 1;
    this._difficulty = 1;
    this._nextGenerationColumn = 0;
    this._nextObstaclePadding = 4;
    this._obstacleHistory = [];
    this._obstacle = undefined;

    //this._simulation.grid.cells[0].forEach((cell) => cell.place(undefined));

    this._simulation.grid.cells[this._simulation.grid.numRows - 1][0].place(
      this._simulation.nonSpectatorPlayers[0]
    );

    for (const player of this._simulation.nonSpectatorPlayers) {
      player.spawnLocation = { column: this._level, row: 0 };
    }

    this._deathLineColumn = -18;
  }

  serialize(): EscapeGameModeState {
    return { deathLineColumn: this._deathLineColumn, level: this._level };
  }

  deserialize(state: EscapeGameModeState) {
    this._deathLineColumn = state.deathLineColumn;
    this._level = state.level;
  }

  checkMistake(player: IPlayer, cells: ICell[], isMistake: boolean): boolean {
    if (isMistake) {
      return true;
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

  if (cell.type == CellType.Deadly) {
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
