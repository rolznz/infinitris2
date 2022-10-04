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
} from '@core/gameModes/EscapeGameMode/obstacles/Obstacle';
import createBehaviourFromChallengeCellType from '@core/grid/cell/behaviours/createBehaviourFromChallengeCellType';
import CellType from '@models/CellType';

type EscapeGameModeState = {
  deathLineColumn: number;
  level: number;
};

export class EscapeGameMode implements IGameMode<EscapeGameModeState> {
  private _simulation: ISimulation;
  private _lastMoveWasMistake: { [playerId: number]: boolean };
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

  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._lastMoveWasMistake = [];
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

    const lastDeathLineColumnFloored = Math.floor(this._deathLineColumn);
    // TODO: sync
    let deathLineIncrease = Math.min(0.02 + this._level * 0.00005, 1);
    if (this._level - this._deathLineColumn > 12) {
      deathLineIncrease += 0.025;
    }
    this._deathLineColumn += deathLineIncrease;

    this._frontDeathLineColumn =
      lastDeathLineColumnFloored + this._simulation.grid.numColumns - 2;
    for (
      let column = this._level;
      column < this._level + this._simulation.grid.numColumns;
      column++
    ) {
      const finishCell = this._simulation.grid.reducedCells.find(
        (cell) =>
          cell.column === wrap(column, this._simulation.grid.numColumns) &&
          cell.type === CellType.FinishChallenge
      );
      if (finishCell) {
        this._frontDeathLineColumn = Math.min(
          finishCell.column + 1,
          this._frontDeathLineColumn
        );
        // TODO: replace while loop with simple equation
        while (this._frontDeathLineColumn < this._level) {
          this._frontDeathLineColumn += this._simulation.grid.numColumns;
        }
        break;
      }
    }

    for (const activePlayer of this._simulation.activePlayers) {
      if (
        activePlayer.block &&
        (activePlayer.block.column === lastDeathLineColumnFloored ||
          activePlayer.block.column === this._frontDeathLineColumn)
      ) {
        activePlayer.block.die();
        activePlayer.spawnLocation = { row: 0, column: this._level };
      }
    }
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

        const validObstacles = this._escapeObstacles.filter(
          (obstacle) =>
            obstacle.difficulty <= this._difficulty &&
            obstacle !== this._obstacle
        );

        this._obstacle =
          validObstacles[
            Math.floor(
              this._simulation.nextRandom('escape-obstacle') *
                validObstacles.length
            )
          ];
        this._obstacleHistory.push(this._obstacle);
        this._nextObstacleColumn = 0;
        this._nextObstaclePadding = 4;
      }
    }

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
    }
  }
  /*private _getNextSpawnLocation(column: number): {
    row: number;
    column: number;
  } {
    // FIXME: this needs to check a 4x4 grid for free space
    let padding = 4;
    let row = padding / 2;
    let found = false;
    while (!found) {
      for (; row < this._simulation.grid.numRows - padding / 2; row++) {
        found = true;
        for (let x = 0; x < padding; x++) {
          for (let y = -padding / 2; y < padding / 2; y++) {
            if (
              !this._simulation.grid.cells[row + y][
                wrap(column + x, this._simulation.grid.numColumns)
              ].isEmpty
            ) {
              found = false;
            }
          }
        }
        if (found) {
          break;
        }
      }
      if (!found) {
        row = padding / 2;
        --column;
        if (column < this._deathLineColumn) {
          break;
        }
      }
    }
    return {
      column,
      row,
    };
  }*/

  onBlockMoved(block: IBlock) {
    for (const cell of block.cells.filter(
      (cell) => cell.type === CellType.FinishChallenge
    )) {
      for (let row = 0; row < this._simulation.grid.numRows; row++) {
        this._simulation.grid.cells[row][cell.column].reset();
      }
    }
  }

  onBlockDied(block: IBlock) {
    this._lastMoveWasMistake[block.player.id] = true;
  }
  onBlockPlaced(block: IBlock) {
    this._lastMoveWasMistake[block.player.id] = false;
    const prevLevel = this._level;
    this._level = Math.max(this._level, block.column);
    if (this._level > prevLevel) {
      this._simulation.addMessage('Level ' + this._level, undefined, false);
    }
    //block.player.spawnLocation = this._getNextSpawnLocation(block.column);
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

  onEndRound() {}

  onPlayerChangeStatus(player: IPlayer) {
    player.spawnLocation = { column: this._level, row: 0 };
  }

  onNextRound() {
    if (!this._simulation.nonSpectatorPlayers.length) {
      return;
    }
    this._lastMoveWasMistake = [];
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

    this._deathLineColumn = -20;
  }

  serialize(): EscapeGameModeState {
    return { deathLineColumn: this._deathLineColumn, level: this._level };
  }

  deserialize(state: EscapeGameModeState) {
    this._deathLineColumn = state.deathLineColumn;
    this._level = state.level;
  }

  checkMistake(player: IPlayer, cells: ICell[], isMistake: boolean): boolean {
    // disable default mistake detection
    // if (isMistake) {
    //   return true;
    // }

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
      return 1000;
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

  let canPlace = false;
  [-1, 1, 0].forEach((neighbourDirection) => {
    const neighbourColumn = wrap(
      cell.column + neighbourDirection,
      simulation.grid.numColumns
    );
    for (
      let row = 0;
      row < Math.min(cell.row + 2, simulation.grid.numRows);
      row++
    ) {
      const neighbour = simulation.grid.cells[row][neighbourColumn];
      canPlace =
        canPlace ||
        ((neighbour.player?.color === player.color ||
          (isForgiving &&
            simulation.wasRecentlyPlaced(neighbour.placementFrame))) &&
          // discard diagonal items
          [
            [-1, 0],
            [1, 0],
            [0, -1],
          ].some((neighbourDirection) => {
            const neighbourNeighbour = simulation.grid.getNeighbour(
              neighbour,
              neighbourDirection[0],
              neighbourDirection[1]
            );
            return (
              neighbourNeighbour?.isEmpty ||
              (isForgiving &&
                neighbourNeighbour &&
                simulation.wasRecentlyPlaced(neighbourNeighbour.placementFrame))
            );
          }));
    }
  });

  return canPlace;
}
