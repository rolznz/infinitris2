import TutorialCellType from '../TutorialCellType';

export default function parseGrid(grid: string): TutorialCellType[][] {
  const cellTypes = grid
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row && !row.startsWith('//'))
    .map((row) =>
      row.split('').map((c) => {
        if (
          Object.values(TutorialCellType).indexOf(c as TutorialCellType) < 0
        ) {
          throw new Error('Invalid tutorial grid');
        }
        return c as TutorialCellType;
      })
    );
  if (cellTypes.find((r) => r.length !== cellTypes[0].length)) {
    throw new Error('Invalid tutorial grid');
  }
  return cellTypes;
}
