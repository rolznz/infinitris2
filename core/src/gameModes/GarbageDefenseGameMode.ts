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
        this._simulation.grid.checkLineClears([cellToFill.row]);
      }
      this._nextCellsToFill = [];
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
      this._simulation.frameNumber > this._nextFillFrame
    ) {
      if (
        this._nextCellsToFill.some(
          (cellToFill) => cellToFill.row === this._getDeathRow()
        )
      ) {
        // TODO: who is the winner? this is a co-op mode. It should show the level?
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
      this._simulation.frameNumber > this._nextGarbageFrame
    ) {
      this._calculateNextGarbageFrame();
      let nextCellsToFill: typeof this._nextCellsToFill = [];
      for (let i = 0; i < this._level; i++) {
        const column = Math.floor(
          this._simulation.nextRandom('garbage_defense_column') *
            this._simulation.grid.numColumns
        );
        let row = this._simulation.grid.numRows - 1;
        for (; row > this._getDeathRow(); row--) {
          if (this._simulation.grid.cells[row][column].isEmpty) {
            break;
          }
        }
        nextCellsToFill.push({ row, column });
      }
      this._simulation.onGameModeEvent({
        type: 'garbageWarning',
        cells: nextCellsToFill,
        isSynced: true,
      });
      this._nextCellsToFill = nextCellsToFill;
      this._nextFillFrame =
        this._simulation.frameNumber + (1000 / FRAME_LENGTH) * 1;
    }
  }

  onNextRound() {
    this._level = 1;
    this._calculateNextGarbageFrame();
  }

  serialize(): GarbageDefenseGameModeState {
    return { level: this._level };
  }
  deserialize(state: GarbageDefenseGameModeState) {
    this._level = state.level;
  }

  getFallDelay(player: IPlayer) {
    // TODO: base on level instead
    return getScoreBasedFallDelay(player);
  }
  onLinesCleared(rows: number[]) {
    // TODO: sync
    /*if (rows.some((row) => row === this._simulation.grid.numRows - 1)) {
      ++this._level;
      this._simulation.addMessage('LEVEL ' + this._level, undefined, false);
    }*/
  }

  private _calculateNextGarbageFrame() {
    if (this._simulation.isNetworkClient) {
      return;
    }
    this._nextGarbageFrame =
      this._simulation.frameNumber + (1000 / FRAME_LENGTH) * 10;
  }

  private _getDeathRow(): number {
    return 0; //this._simulation.grid.getTowerRow();
  }
}
