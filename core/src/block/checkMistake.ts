import ICell from '@models/ICell';
import ISimulation from '@models/ISimulation';

export function checkMistake(cells: ICell[], simulation: ISimulation) {
  // imperfect mistake detection that will probably not work for non-tetromino block layouts
  let isMistake = false;
  let bottomRow = 0;
  for (const cell of cells) {
    bottomRow = Math.max(bottomRow, cell.row);
  }

  if (
    simulation.settings.preventTowers !== false &&
    simulation.grid.isTower(bottomRow)
  ) {
    isMistake = true;
  } else {
    for (const cell of cells) {
      // placing block A leaves hard-to-fill gap X
      //AA
      //AX
      //A
      const cellBelow = simulation.grid.getNeighbour(cell, 0, 1);
      if (cellBelow?.isPassable && !cells.includes(cellBelow)) {
        isMistake = true;
      }
    }
  }

  return isMistake;
}
