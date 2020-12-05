import tetrominoes from '../Tetrominoes';
import Tutorial from '../Tutorial';

const gridHeight = 7;

const blockPlacement: Tutorial = {
  title: 'Block Placement',
  description: 'Receive points for placing blocks',
  highlightScore: true,
  layout: tetrominoes.T,
  layoutRotation: 2,
  gridWidth: 7,
  gridHeight,
  filledCellLocations: [
    { col: 1, row: gridHeight - 2 },
    { col: 2, row: gridHeight - 2 },
    { col: 4, row: gridHeight - 2 },
    { col: 6, row: gridHeight - 2 },
    { col: 1, row: gridHeight - 3 },
    { col: 6, row: gridHeight - 3 },
  ],
  filledRows: [gridHeight - 1],
  allowedActions: [],
};

export default blockPlacement;
