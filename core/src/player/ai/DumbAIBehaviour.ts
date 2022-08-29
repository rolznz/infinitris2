import { ColumnConquestGameMode } from '@core/gameModes/ColumnConquestGameMode';
import IBlock, { BlockCanMoveOptions } from '@models/IBlock';
import ICell from '@models/ICell';
import ISimulation from '@models/ISimulation';
import { AIAction, IAIBehaviour } from './IAIBehaviour';

// Inspired by Timur Bakibayev's article https://levelup.gitconnected.com/tetris-ai-in-python-bd194d6326ae
// Cons:
// - inefficient algorithm (brute force checks every single rotation and column to find the best)
// - unaware of walls - the AI may try to get past it and get stuck, and does not know how to climb
// - unaware of other players' movement
export class DumbAIBehaviour implements IAIBehaviour {
  private _simulation: ISimulation;
  private _allowMistakes: boolean;
  constructor(simulation: ISimulation, allowMistakes: boolean = false) {
    this._simulation = simulation;
    this._allowMistakes = allowMistakes;
  }

  // TODO: pass grid instead of gridCells
  calculateNextAction(block: IBlock): AIAction {
    let bestRotationOffset = 0;
    let bestColumnOffset = 0;
    let bestScore = 0;
    const gridCells = this._simulation.grid.cells;
    const maxAttempts = gridCells[0].length; //Math.min(17, gridCells[0].length); //current column + 8 on each side (or grid width if smaller)

    for (let i = 0; i < maxAttempts; i++) {
      // check closest columns first (0, 1, -1, 2, -2, 3, -3...)
      let half = Math.floor((i + 1) / 2);
      let dx = i > 0 ? (i % 2 == 1 ? half : -half) : 0;
      for (let dr = 0; dr < 4; dr++) {
        let isValidPlacement = false;
        let dy = 0;
        const canMoveOptions: BlockCanMoveOptions = {
          allowMistakes: this._allowMistakes,
        };

        for (; dy < gridCells.length; dy++) {
          const canMove = block.canMove(dx, dy, dr, canMoveOptions);
          if (
            canMove &&
            canMoveOptions.cells &&
            canMoveOptions.cells.some(
              (cell) =>
                cell.row === this._simulation.grid.numRows - 1 ||
                !this._simulation.grid.cells[cell.row + 1][cell.column]
                  .isPassable
            ) &&
            (!canMoveOptions.isMistake || this._allowMistakes)
          ) {
            isValidPlacement = true;
            break;
          } else if (!canMove) {
            break;
          }
        }

        const score = this._calculateScore(block, dx, dy, dr, canMoveOptions);
        if (isValidPlacement && score > bestScore) {
          bestScore = score;
          bestColumnOffset = dx;
          bestRotationOffset = dr;
        }
      }
    }
    if (bestScore === 0) {
      return {
        dx: 0,
        dy: 0,
        dr: 0,
        drop: false,
      };
    }

    if (bestRotationOffset !== 0) {
      return {
        dy: 0,
        dx: 0,
        dr: bestRotationOffset < 2 ? 1 : -1,
        drop: false,
      };
    }

    if (bestColumnOffset !== 0) {
      return {
        dy: 0,
        dx: bestColumnOffset > 0 ? 1 : -1,
        dr: 0,
        drop: false,
      };
    }

    return {
      dy: 0,
      dx: 0,
      dr: 0,
      drop: true,
    };
  }
  private _calculateScore(
    block: IBlock,
    dx: number,
    dy: number,
    dr: number,
    canMoveOptions: BlockCanMoveOptions
  ): number {
    if (this._simulation.settings.gameModeType === 'column-conquest') {
      const gameMode = this._simulation.gameMode as ColumnConquestGameMode;

      if (canMoveOptions.cells) {
        if (
          !canMoveOptions.cells.some(
            (cell) =>
              gameMode.columnCaptures[cell.column].playerId !== block.player.id
          )
        ) {
          dy -= 4; // focus on attacking other player's cells instead
        }
      }
    }
    return dy;
  }
}
