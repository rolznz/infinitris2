import { getScoreBasedFallDelay } from '@core/gameModes/InfinityGameMode';
import { FRAME_LENGTH } from '@core/simulation/Simulation';
import { GameModeEvent } from '@models/GameModeEvent';
import { IGameMode } from '@models/IGameMode';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

type GarbageDefenseGameModeState = {
  level: number;
};
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
        this._simulation.grid.cells[cellToFill.row][cellToFill.column].place(
          undefined
        );
      }
      this._simulation.grid.checkLineClears(
        event.cells
          .map((cell) => cell.row)
          .filter((row, i, rows) => rows.indexOf(row) === i)
      );
      this._nextCellsToFill = [];
    } else if (event.type === 'garbageWarning') {
      this._nextCellsToFill.push(...event.cells);
    }
  }

  getMinPlayersForRound(): number {
    return 1;
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
      if (
        this._nextCellsToFill.some(
          (cellToFill) => cellToFill.row === this._getDeathRow()
        )
      ) {
        // TODO: who is the winner? this is a co-op mode. It should show the level?
        console.log('a garbage cell hit the death row');
        this._simulation.round!.end(undefined);
      } else {
        this._simulation.onGameModeEvent({
          type: 'garbagePlaced',
          cells: this._nextCellsToFill,
          isSynced: true,
        });
      }
    }
    if (
      !this._simulation.isNetworkClient &&
      this._simulation.frameNumber > this._nextGarbageFrame &&
      !this._nextCellsToFill.length
    ) {
      this._calculateNextGarbageFrame();
      const nextCellsToFill: typeof this._nextCellsToFill = [];
      const requiredRowsEmpty = Math.floor(this._level / 10) % 3; // [1 => 0, 11 => 1, 21 => 2, 31 => 0]
      const numGarbageToGenerate = Math.min(
        requiredRowsEmpty > 1 ? 1 : requiredRowsEmpty > 0 ? 3 : 9,
        this._level
      ); // max 9 for simple, 1 for extra difficult

      const numGarbageToGenerateClamped = Math.min(
        numGarbageToGenerate,
        Math.floor(this._simulation.grid.numColumns / 2)
      ); // don't generate too many for small grids
      for (let i = 0; i < numGarbageToGenerateClamped; i++) {
        const column = Math.floor(
          this._simulation.nextRandom('garbage_defense_column') *
            this._simulation.grid.numColumns
        );
        let row = this._simulation.grid.numRows - 1;
        let numRowsEmpty = 0;

        for (; row > this._getDeathRow(); row--) {
          if (this._simulation.grid.cells[row][column].isEmpty) {
            ++numRowsEmpty;
            if (numRowsEmpty > requiredRowsEmpty) {
              break;
            }
          } else {
            numRowsEmpty = 0;
          }
        }
        nextCellsToFill.push({ row, column });
      }
      this._simulation.onGameModeEvent({
        type: 'garbageWarning',
        cells: nextCellsToFill,
        isSynced: true,
      });
      this._nextFillFrame =
        this._simulation.frameNumber + (1000 / FRAME_LENGTH) * 1;
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

  private _calculateNextGarbageFrame() {
    if (this._simulation.isNetworkClient) {
      return;
    }

    const maxLevel = 100;
    // TODO: make the speed more variable
    this._nextGarbageFrame =
      this._simulation.frameNumber +
      (1000 / FRAME_LENGTH) *
        10 *
        (1 - Math.min(this._level, maxLevel - 1) / maxLevel);
  }

  private _getDeathRow(): number {
    return 0; //this._simulation.grid.getTowerRow();
  }
}
