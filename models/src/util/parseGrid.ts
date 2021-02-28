import ChallengeCellType from '../ChallengeCellType';

export default function parseGrid(grid: string): ChallengeCellType[][] {
  const cellTypes = grid
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row && !row.startsWith('//'))
    .map((row) =>
      row.split('').map((c) => {
        if (
          Object.values(ChallengeCellType).indexOf(c as ChallengeCellType) < 0
        ) {
          throw new Error('Invalid challenge grid');
        }
        return c as ChallengeCellType;
      })
    );
  if (cellTypes.find((r) => r.length !== cellTypes[0].length)) {
    throw new Error('Invalid challenge grid');
  }
  return cellTypes;
}
