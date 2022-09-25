import ICell from '@models/ICell';
import { IPlayer } from '@models/IPlayer';
import ISimulation from '@models/ISimulation';

export function checkMistake(
  player: IPlayer,
  cells: ICell[],
  simulation: ISimulation,
  allowTowers = true
) {
  // imperfect mistake detection that will probably not work for non-tetromino block layouts
  let isMistake = false;
  let topRow = simulation.grid.numRows - 1;
  for (const cell of cells) {
    topRow = Math.min(topRow, cell.row);
  }

  if (
    simulation.settings.preventTowers !== false &&
    simulation.isTower(topRow) &&
    !allowTowers
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

    if (simulation.gameMode.checkMistake) {
      isMistake = simulation.gameMode.checkMistake(player, cells, isMistake);
    }
  }

  return isMistake;
}
