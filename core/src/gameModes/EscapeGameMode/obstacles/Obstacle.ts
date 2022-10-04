import ChallengeCellType from '@models/ChallengeCellType';

export type EscapeObstacleGrid = {
  row: number;
  type?: ChallengeCellType;
}[][];

export type EscapeObstacleTemplate = {
  createGrid: (numRows: number) => EscapeObstacleGrid;
  difficulty: number;
};

export type EscapeObstacle = Omit<EscapeObstacleTemplate, 'createGrid'> & {
  grid: EscapeObstacleGrid;
};

const pole1: EscapeObstacleTemplate = {
  createGrid: () => [[...new Array(1)].map((_, i) => ({ row: -(i + 1) }))],
  difficulty: 1,
};
const pole2: EscapeObstacleTemplate = {
  createGrid: () => [[...new Array(2)].map((_, i) => ({ row: -(i + 1) }))],
  difficulty: 2,
};
const pole3: EscapeObstacleTemplate = {
  createGrid: () => [[...new Array(3)].map((_, i) => ({ row: -(i + 1) }))],
  difficulty: 3,
};
const pole4: EscapeObstacleTemplate = {
  createGrid: () => [
    [...new Array(4)].map((_, i) => ({ row: -(i + 1) })),
    [{ row: -1 }],
  ],
  difficulty: 4,
};

const slice1: EscapeObstacleTemplate = {
  createGrid: () => [...new Array(10)].map((_, i) => [{ row: -4 }]),
  difficulty: 5,
};

const stair1: EscapeObstacleTemplate = {
  createGrid: () => [...new Array(10)].map((_, i) => [{ row: -(i + 1) }]),
  difficulty: 5,
};
const stair2: EscapeObstacleTemplate = {
  createGrid: () => [...new Array(10)].map((_, i) => [{ row: -(10 - i) }]),
  difficulty: 5,
};

const reset1: EscapeObstacleTemplate = {
  createGrid: (numRows) => [
    [
      ...[...new Array(numRows - 4)].map((_, i) => ({ row: i })),
      ...[...new Array(4)].map((_, i) => ({
        row: -(i + 1),
        type: ChallengeCellType.Finish,
      })),
    ],
  ],
  difficulty: 5,
};

const reset2: EscapeObstacleTemplate = {
  createGrid: (numRows) => [
    [
      ...[...new Array(numRows - 4)].map((_, i) => ({ row: -(i + 1) })),
      ...[...new Array(4)].map((_, i) => ({
        row: i,
        type: ChallengeCellType.Finish,
      })),
    ],
  ],
  difficulty: 5,
};

const deadly1: EscapeObstacleTemplate = {
  createGrid: () =>
    [...new Array(16)].map(() => [{ row: -1, type: ChallengeCellType.Deadly }]),
  difficulty: 6,
};
const deadly2: EscapeObstacleTemplate = {
  createGrid: (numRows) =>
    [...new Array(Math.floor(numRows / 2))].map((_, i) => [
      { row: -(i + 1), type: ChallengeCellType.Deadly },
    ]),
  difficulty: 6,
};
const deadly3: EscapeObstacleTemplate = {
  createGrid: () =>
    [...new Array(6)].map((_, i) => [
      {
        row: -(5 - i + 1),
        type: ChallengeCellType.Deadly,
      },
    ]),
  difficulty: 7,
};
const deadly4: EscapeObstacleTemplate = {
  createGrid: () =>
    [...new Array(6)].map((_) =>
      [...new Array(6)].map((_, i) => ({
        row: -(i + 1),
        type: ChallengeCellType.Deadly,
      }))
    ),
  difficulty: 7,
};

export function createEscapeObstacles(numRows: number): EscapeObstacle[] {
  return [
    pole1,
    pole2,
    pole3,
    pole4,
    slice1,
    reset1,
    reset2,
    deadly1,
    deadly2,
    deadly3,
    deadly4,
    stair1,
    stair2,
  ].map((template) => {
    const { createGrid, ...otherProps } = template;
    return { grid: createGrid(numRows), ...otherProps };
  });
}
