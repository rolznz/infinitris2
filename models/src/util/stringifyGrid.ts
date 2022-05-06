import IGrid from '@models/IGrid';

export function stringifyGrid(grid: IGrid): string {
  let result = '';
  for (let row = 0; row < grid.cells.length; row++) {
    for (let col = 0; col < grid.cells[0].length; col++) {
      result += grid.cells[row][col].behaviour.toChallengeCellType();
    }
    result += '\n';
  }
  return result;
}
