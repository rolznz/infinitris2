import { getScoreBasedFallDelay } from '@core/gameModes/InfinityGameMode';
import { FRAME_LENGTH } from '@core/simulation/Simulation';
import { GameModeEvent } from '@models/GameModeEvent';
import { IGameMode } from '@models/IGameMode';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type GarbageDefenseGameModeState = {
  level: number;
};

const maxLevel = 100;
export class GarbageDefenseGameMode
  implements IGameMode<GarbageDefenseGameModeState>
{
  private _simulation: ISimulation;
  private _level: number;
  private _nextGarbageFrame: number;
  private _nextCellsToFill: { row: number; column: number }[];
  private _nextFillFrame: number;
  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._level = 0;
    this._nextGarbageFrame = 0;
    this._nextCellsToFill = [];
    this._nextFillFrame = 0;
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

  onGameModeEvent(event: GameModeEvent) {
    if (event.type === 'garbagePlaced') {
      for (const cellToFill of event.cells) {
        if (
          this._simulation.grid.cells[cellToFill.row][cellToFill.column].isEmpty
        ) {
          this._simulation.grid.cells[cellToFill.row][cellToFill.column].place(
            undefined
          );
        }
      }
      this._simulation.grid.checkLineClears(
        event.cells
          .map((cell) => cell.row)
          .filter((row) => row !== 0) // don't clear top line, this is the end game condition
          .filter((row, i, rows) => rows.indexOf(row) === i) // remove duplicates
      );

      // end game condition - top row is full and there are no pending line clears
      if (
        !this._simulation.isNetworkClient &&
        !this._simulation.grid.nextLinesToClear.length &&
        !this._simulation.grid.cells[0].some((cell) => cell.isEmpty)
      ) {
        console.log('a garbage cell hit the death row');
        // TODO: who is the winner? this is a co-op mode. It should show the level instead?
        this._simulation.round!.end(undefined);
      }
      this._nextCellsToFill = [];
    } else if (event.type === 'garbageWarning') {
      this._nextCellsToFill.push(...event.cells);
    }
  }

  getMinPlayersForRound(): number {
    return 1;
  }
  getTowerRow(): number {
    return 0;
  }

  step(): void {
    if (this._simulation.round!.isWaitingForNextRound) {
      return;
    }

    if (
      !this._simulation.isNetworkClient &&
      this._simulation.frameNumber > this._nextFillFrame &&
      this._nextCellsToFill.length
    ) {
      this._simulation.onGameModeEvent({
        type: 'garbagePlaced',
        cells: this._nextCellsToFill,
        isSynced: true,
      });
    }
    if (
      !this._simulation.isNetworkClient &&
      this._simulation.frameNumber > this._nextGarbageFrame &&
      !this._nextCellsToFill.length
    ) {
      this._calculateNextGarbageFrame();
      const nextCellsToFill: typeof this._nextCellsToFill = [];
      const requiredRowsEmpty = Math.floor(this._level / 10) % 3 === 1 ? 1 : 0; // [1 => 0, 11 => 1, 21 => 0, 31 => 0]
      const numGarbageToGenerate = Math.min(
        requiredRowsEmpty === 1 ? 3 : 9,
        this._level,
        Math.floor(this._simulation.grid.numColumns / 2)
      );

      for (let i = 0; i < numGarbageToGenerate; i++) {
        const okColumns = [...new Array(this._simulation.grid.numColumns)]
          .map((_, index) => index)
          .filter(
            (column) =>
              this._simulation.grid.cells[0][column].isEmpty &&
              !nextCellsToFill.some(
                (existingCellToFill) => column === existingCellToFill.column
              )
          );
        if (!okColumns.length) {
          break;
        }
        const column =
          okColumns[
            Math.floor(
              this._simulation.nextRandom('garbage_defense_column') *
                okColumns.length
            )
          ];
        let row = this._simulation.grid.numRows - 1;
        let numRowsEmpty = 0;
        // alternate way of generating requiredRowsEmpty per cell
        // to fix also need to ensure that the entire column is checked
        // to make sure the garbage isn't unintentionally filling in a gap
        /*const requiredRowsEmptyRandom = Math.pow(
          this._simulation.nextRandom('garbage_defense_rows_empty'),
          1 / (Math.min(this._level, maxLevel) / maxLevel)
        );
        console.log('requiredRowsEmptyRandom', requiredRowsEmptyRandom);
        const requiredRowsEmpty =
          requiredRowsEmptyRandom > 0.95
            ? 2
            : requiredRowsEmptyRandom > 0.9
            ? 1
            : 0;*/

        for (; row > this._getDeathRow(); row--) {
          if (
            this._simulation.grid.cells[row][column].isEmpty &&
            this._simulation.grid.cells[row].filter((cell) => cell.isEmpty)
              .length -
              nextCellsToFill.filter(
                (existingCellToFill) => existingCellToFill.row === row
              ).length >
              1 /* avoid line clears */
          ) {
            ++numRowsEmpty;
            if (
              numRowsEmpty > requiredRowsEmpty ||
              row <=
                1 /* near top of grid, don't create garbage with a gap below*/
            ) {
              break;
            }
          } else {
            numRowsEmpty = 0;
          }
        }
        if (
          row > 0 ||
          this._simulation.grid.cells[1].filter((cell) => cell.isEmpty)
            .length === 1
        ) {
          // only fill top row when 2nd row is filled except for one cell (totally filled would cause a line clear)
          nextCellsToFill.push({ row, column });
        }
      }
      if (nextCellsToFill.length) {
        this._simulation.onGameModeEvent({
          type: 'garbageWarning',
          cells: nextCellsToFill,
          isSynced: true,
        });
        this._nextFillFrame =
          this._simulation.frameNumber + (1000 / FRAME_LENGTH) * 1;
      }
    }
  }

  onNextRound() {
    this._level = 1;
    this._nextCellsToFill = [];
    this._calculateNextGarbageFrame();
  }

  serialize(): GarbageDefenseGameModeState {
    return { level: this._level };
  }
  deserialize(state: GarbageDefenseGameModeState) {
    this._level = state.level;
  }

  getFallDelay(player: IPlayer) {
    // TODO: base on level instead?
    return getScoreBasedFallDelay(player);
  }
  onLinesCleared(rows: number[]) {
    this._level += rows.length;
    this._simulation.addMessage('LEVEL ' + this._level, undefined, false);
    // TODO: add an event for this
    this._nextCellsToFill = [];
  }

  allowsSpawnAboveGrid(): boolean {
    return true;
  }

  private _calculateNextGarbageFrame() {
    if (this._simulation.isNetworkClient) {
      return;
    }

    // TODO: consider making the speed more variable?
    this._nextGarbageFrame =
      this._simulation.frameNumber +
      (1000 / FRAME_LENGTH) *
        10 *
        (1 - Math.min(this._level, maxLevel - 1) / maxLevel);
  }

  private _getDeathRow(): number {
    return 0; //this._simulation.getTowerRow();
  }
}
