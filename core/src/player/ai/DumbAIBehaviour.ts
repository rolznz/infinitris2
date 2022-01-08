import IBlock, { BlockCanMoveOptions } from '@models/IBlock';
import ICell from '@models/ICell';
import { AIAction, IAIBehaviour } from './IAIBehaviour';

// Inspired by Timur Bakibayev's article https://levelup.gitconnected.com/tetris-ai-in-python-bd194d6326ae
// Cons:
// - inefficient algorithm (brute force checks every single rotation and column to find the best)
// - cannot slip into gaps (no pathfinding)
// - unaware of walls - the AI may try to get past it and get stuck
// - unaware of other players' movement
// - unaware of days / grid collapse
export class DumbAIBehaviour implements IAIBehaviour {
  private _allowMistakes: boolean;
  constructor(allowMistakes: boolean = false) {
    this._allowMistakes = allowMistakes;
  }

  // TODO: pass grid instead of gridCells
  calculateNextAction(block: IBlock, gridCells: ICell[][]): AIAction {
    let bestRotationOffset = 0;
    let bestColumnOffset = 0;
    let bestScore = 0;
    const maxAttempts = Math.min(17, gridCells[0].length); //current column + 8 on each side (or grid width if smaller)

    for (let i = 0; i < maxAttempts; i++) {
      // check closest columns first (0, 1, -1, 2, -2, 3, -3...)
      let half = Math.floor((i + 1) / 2);
      let dx = i > 0 ? (i % 2 == 1 ? half : -half) : 0;
      for (let dr = 0; dr < 4; dr++) {
        let hit = false;
        let dy = block.layout.length;
        const canMoveOptions: BlockCanMoveOptions = {
          allowMistakes: this._allowMistakes,
        };
        for (; dy < gridCells.length; dy++) {
          if (!block.canMove(dx, dy, dr, canMoveOptions)) {
            hit = true;
            break;
          }
        }
        if (dy > bestScore && !canMoveOptions.isMistake) {
          bestScore = dy;
          bestColumnOffset = dx;
          bestRotationOffset = dr;
        }
      }
    }

    if (bestRotationOffset != 0) {
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
}
