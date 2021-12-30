import ICell from '@models/ICell';
import ISimulation from '@models/ISimulation';

export function checkMistake(cells: ICell[], simulation: ISimulation) {
  // imperfect mistake detection that will probably not work for non-tetromino block layouts
  let isMistake = false;
  for (const cell of cells) {
    // placing block A leaves hard-to-fill gap X
    //AA
    //AX
    //A
    const cellBelow = simulation.grid.getNeighbour(cell, 0, 1);
    if (cellBelow?.isEmpty && !cells.includes(cellBelow)) {
      isMistake = true;
    }

    // TODO: review below, also needs cells.includes check for bots, extract to helper function
    // B block placed after A causes unfillable gap X
    //AA
    //AXBB
    //A BB
    /*for (let c = -1; c <= 1; c += 2) {
      const cellSide = simulation.grid.getNeighbour(cell, c, 0);
      if (cellSide?.isEmpty) {
        const cellAbove = simulation.grid.getNeighbour(cellSide, 0, -1);
        if (!cellAbove?.isEmpty) {
          isMistake = true;
        } else {
          // B block placed after A causes unfillable gap X
          //AA
          //AX B
          //A BBB
          const nextAcross = simulation.grid.getNeighbour(cellSide, c, 0);
          if (nextAcross?.isEmpty) {
            const cellAboveNextAcross = simulation.grid.getNeighbour(
              nextAcross,
              0,
              -1
            );
            if (!cellAboveNextAcross?.isEmpty) {
              isMistake = true;
            }
          }
        }
      }
    }*/
  }
  return isMistake;
}
