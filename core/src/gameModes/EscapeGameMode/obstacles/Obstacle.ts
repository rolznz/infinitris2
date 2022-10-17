import ChallengeCellType from '@models/ChallengeCellType';

export const RESET_COLUMNS = 4;

export type EscapeObstacleGrid = {
  row: number;
  type?: ChallengeCellType;
}[][];

export type EscapeObstacleTemplate = {
  createGrid: (numRows: number) => EscapeObstacleGrid;
  difficulty: number;
  bridgePadding?: number;
};

export type EscapeObstacle = Omit<EscapeObstacleTemplate, 'createGrid'> & {
  grid: EscapeObstacleGrid;
};

// FIXME: replace Math.random with simulation nextRandom for replayability
function createPartialLineClear(
  numRows: number,
  numColumns: number,
  emptyProportion: number,
  nextRandom: () => number
): EscapeObstacleTemplate {
  const partialClearRows = numRows + 2;
  const garbageAndFinish = [...new Array(numColumns)].map(() => [
    ...[...new Array(numRows)].map((_, i) => ({
      row: -(i + 2),
      type:
        nextRandom() < emptyProportion
          ? ChallengeCellType.Empty
          : ChallengeCellType.Full,
    })),
    ...[...new Array(1)].map((_, i) => ({
      row: -(i + 1),
      type: ChallengeCellType.Finish,
    })),
  ]);
  // make sure each garbage row has at least one space free (otherwise the line will be full and unclearable)
  for (let row = 0; row < numRows; row++) {
    let isFull = true;
    for (let c = 0; c < numColumns; c++) {
      if (garbageAndFinish[c][row].type !== ChallengeCellType.Full) {
        isFull = false;
        break;
      }
    }
    if (isFull) {
      garbageAndFinish[Math.floor(nextRandom() * numColumns)][row].type =
        ChallengeCellType.Empty;
    }
  }

  const obstacle = {
    createGrid: () => [
      [...new Array(partialClearRows)].map((_, i) => ({
        row: -(i + 1),
        type: ChallengeCellType.PartialClear,
      })),
      ...garbageAndFinish,
      [...new Array(partialClearRows)].map((_, i) => ({
        row: -(i + 1),
        type: ChallengeCellType.PartialClear,
      })),
    ],
    difficulty: Math.ceil(
      numRows * numColumns * (1 / Math.max(emptyProportion, 0.1)) * 0.5
    ),
  };

  return obstacle;
}

const pole1: EscapeObstacleTemplate = {
  createGrid: () => [[...new Array(1)].map((_, i) => ({ row: -(i + 1) }))],
  difficulty: 1,
};
const pole2: EscapeObstacleTemplate = {
  createGrid: () => [[...new Array(2)].map((_, i) => ({ row: -(i + 1) }))],
  difficulty: 2,
};
const pole3: EscapeObstacleTemplate = {
  createGrid: () => [
    [...new Array(3)].map((_, i) => ({ row: -(i + 1) })),
    [{ row: -1 }],
  ],
  difficulty: 4,
};

const reset1: EscapeObstacleTemplate = {
  createGrid: (numRows) =>
    [...new Array(RESET_COLUMNS)].map(() => [
      ...[...new Array(numRows - 4)].map((_, i) => ({ row: i })),
      ...[...new Array(4)].map((_, i) => ({
        row: -(i + 1),
        type: ChallengeCellType.Finish,
      })),
    ]),
  difficulty: 5,
};
const reset2: EscapeObstacleTemplate = {
  createGrid: (numRows) =>
    [...new Array(RESET_COLUMNS)].map(() => [
      ...[...new Array(numRows - 4)].map((_, i) => ({ row: -(i + 1) })),
      ...[...new Array(4)].map((_, i) => ({
        row: i,
        type: ChallengeCellType.Finish,
      })),
    ]),
  difficulty: 6,
};

// const slice1: EscapeObstacleTemplate = {
//   createGrid: () => [...new Array(10)].map((_, i) => [{ row: -4 }]),
//   difficulty: 5,
// };

// const stair1: EscapeObstacleTemplate = {
//   createGrid: () => [...new Array(10)].map((_, i) => [{ row: -(i + 1) }]),
//   difficulty: 5,
// };
// const stair2: EscapeObstacleTemplate = {
//   createGrid: () => [...new Array(10)].map((_, i) => [{ row: -(10 - i) }]),
//   difficulty: 5,
// };

const deadly3: EscapeObstacleTemplate = {
  createGrid: () =>
    [...new Array(6)].map((_, i) =>
      [...new Array(i + 1)].map((_, j) => ({
        row: -(j + 1),
        type: ChallengeCellType.Deadly,
      }))
    ),
  difficulty: 8,
  bridgePadding: 1,
};
const deadly3b: EscapeObstacleTemplate = {
  createGrid: () =>
    [...new Array(6)].map((_, i) =>
      [...new Array(6 - i)].map((_, j) => ({
        row: -(j + 1),
        type: ChallengeCellType.Deadly,
      }))
    ),
  difficulty: 9,
  bridgePadding: 1,
};
const deadly4: EscapeObstacleTemplate = {
  createGrid: () =>
    [...new Array(4)].map((_, c) =>
      [...new Array(4)].map((_, r) => ({
        row: -(r + 1),
        type: ChallengeCellType.Deadly,
      }))
    ),
  difficulty: 7,
  bridgePadding: 1,
};

export function createEscapeObstacles(
  numRows: number,
  nextRandom: () => number
): EscapeObstacle[] {
  const partialLineClears = [...new Array(6)].map((_, numRows) =>
    [...new Array(6)].map((_, numColumns) =>
      createPartialLineClear(numRows + 2, numColumns + 2, 0.4, nextRandom)
    )
  );
  return [
    pole1,
    pole2,
    pole3,
    reset1,
    reset2,
    deadly3,
    deadly3b,
    deadly4,
    ...([] as EscapeObstacleTemplate[]).concat(...partialLineClears),
  ].map((template) => {
    const { createGrid, ...otherProps } = template;
    return {
      grid: insertBridge(
        createGrid(numRows),
        numRows,
        otherProps.bridgePadding
      ),
      ...otherProps,
    };
  });
}

function insertBridge(
  grid: EscapeObstacleGrid,
  numRows: number,
  padding = 0
): EscapeObstacleGrid {
  if (padding > 0) {
    for (const existingColumn of grid) {
      while (existingColumn.length < numRows) {
        const freeRow = [...new Array(numRows)]
          .map((_, i) => i)
          .find(
            (index) =>
              !existingColumn.some(
                (row) => row.row === index || numRows + row.row === index
              )
          );
        if (freeRow === undefined) {
          throw new Error('Unable to insert bridge cell');
        }
        existingColumn.push({
          row: freeRow,
          type: ChallengeCellType.BridgeCreator,
        });
      }
    }

    const paddingColumns = [...new Array(padding * 5)].map((_, c) =>
      [...new Array(numRows)].map((_, r) => ({
        row: r,
        type: ChallengeCellType.BridgeCreator,
      }))
    );

    grid.unshift(...paddingColumns);
    grid.push(...paddingColumns);
  }
  return grid;
}
