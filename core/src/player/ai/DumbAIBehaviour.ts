import LayoutUtils from '@core/block/layout/LayoutUtils';
import IBlock from '@models/IBlock';
import ICell from '@models/ICell';
import { AIAction, IAIBehaviour } from './IAIBehaviour';

// dumb AI that isn't too derpy
export class DumbAIBehaviour implements IAIBehaviour {
  calculateNextAction(block: IBlock, gridCells: ICell[][]): AIAction {
    // 1. find optimal drop position with clear path
    // optimal = lowest (per cell score) + without leaving gaps

    let bestOrientationScore = 0;
    let bestOrientation = 0;
    for (let i = 0; i < 4; i++) {
      const rotatedLayout = LayoutUtils.rotate(block.layout, i);
      let lowestRow = rotatedLayout.length - 1;
      while (lowestRow > 0) {
        if (rotatedLayout[lowestRow].some((cell) => cell)) {
          break;
        }
        --lowestRow;
      }
      let score = rotatedLayout[lowestRow].filter((cell) => cell).length;
      if (score > bestOrientationScore) {
        bestOrientation = i;
        bestOrientationScore = score;
      }
    }

    if (bestOrientation != 0) {
      return {
        dy: 0,
        dx: 0,
        dr: 1,
        drop: false,
      };
    }

    let bestColumn = 0;
    let bestColumnScore = 0;
    // TODO: use grid instead of gridCells
    const maxAttempts = gridCells[0].length;
    for (let i = 0; i < maxAttempts; i++) {
      let half = Math.floor((i + 1) / 2);
      let cd = i > 0 ? (i % 2 == 1 ? half : -half) : 0;
      const cdClamped =
        (((block.column + cd) % gridCells[0].length) + gridCells[0].length) %
        gridCells[0].length;
      for (let r = gridCells.length - 1; r > 0; r--) {
        if (gridCells[r][cdClamped].isEmpty) {
          if (r > bestColumnScore) {
            bestColumnScore = r;
            bestColumn = cdClamped;
            console.log('Selected best column: ', cdClamped, block.column);
          }
          break;
        }
      }
    }

    if (bestColumn !== block.column) {
      return {
        dy: 0,
        dx: bestColumn > block.column ? 1 : -1,
        dr: 0,
        drop: false,
      };
    }

    return {
      dy: 1,
      dx: 0,
      dr: 0,
      drop: false,
    };
  }
}
