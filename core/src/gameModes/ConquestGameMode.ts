import { IGameMode } from '@models/IGameMode';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

export interface IColumnCapture {
  //column:
  player?: IPlayer;
  value: number;
}

export class ConquestGameMode implements IGameMode {
  private _columnCaptures: IColumnCapture[];
  private _simulation: ISimulation;
  private _lastCalculation: number;
  constructor(simulation: ISimulation) {
    this._simulation = simulation;
    this._columnCaptures = [...new Array(simulation.grid.numColumns)].map(
      () => ({
        value: 0,
      })
    );
    this._lastCalculation = 0;
  }

  get columnCaptures(): IColumnCapture[] {
    return this._columnCaptures;
  }

  // TODO: handle on player exit

  step(): void {
    // TODO: find a simple way to sync rather than having to send all column data each frame
    // can client scores be slightly off and still function correctly? (this could get out of sync if events are based on score)
    if (this._simulation.isNetworkClient || ++this._lastCalculation < 100) {
      return;
    }
    this._lastCalculation = 0;

    const summedPlayerScores = this._simulation.players
      .map((player) => player.score)
      .reduce((a, b) => a + b);

    const playerColumnCaptureCounts: { [playerId: number]: number } = {};
    for (let c = 0; c < this._simulation.grid.numColumns; c++) {
      const playerCaptureValues: { [playerId: number]: number } = {};
      for (let r = 0; r < this._simulation.grid.numRows; r++) {
        const cell = this._simulation.grid.cells[r][c];
        if (!cell.isEmpty && cell.player) {
          // TODO: consider lower cells having more weighting
          // give higher capture value for player with high score
          playerCaptureValues[cell.player.id] =
            (playerCaptureValues[cell.player.id] || 0) +
            1 * (1 + (cell.player.score / summedPlayerScores) * 3);
        }
      }
      const highestPlayerEntry = Object.entries(playerCaptureValues)
        .map((e) => ({ playerId: e[0], value: e[1] }))
        .find(
          (entry, _, array) => !array.some((other) => other.value > entry.value)
        );

      if (highestPlayerEntry) {
        const highestPlayer = this._simulation.getPlayer(
          parseInt(highestPlayerEntry.playerId)
        );
        const dominance =
          highestPlayerEntry.value /
          Object.values(playerCaptureValues).reduce((a, b) => a + b);
        // multiply by number of captured cells
        const changeMultiplier = 0.02 * highestPlayerEntry.value;
        if (
          this._columnCaptures[c].player !== highestPlayer &&
          this._columnCaptures[c].value > 0
        ) {
          this._columnCaptures[c].value = Math.max(
            this._columnCaptures[c].value - dominance * changeMultiplier,
            0
          );
        } else {
          this._columnCaptures[c].value = Math.min(
            this._columnCaptures[c].value + dominance * changeMultiplier,
            1
          );
          if (this._columnCaptures[c].player !== highestPlayer) {
            this._columnCaptures[c].player = highestPlayer;
          }
          if (this._columnCaptures[c].value === 1) {
            playerColumnCaptureCounts[highestPlayer.id] =
              (playerColumnCaptureCounts[highestPlayer.id] || 0) + 1;
            highestPlayer.score += 1;
          }
        }
      }
    }
  }
}
