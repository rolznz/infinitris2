import Layout, { LayoutSet } from '../Layout';

const I: Layout = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 0, 0],
];

const L: Layout = [
  [1, 0],
  [1, 1],
];

const trominoes: LayoutSet = {
  id: 'trominoes',
  name: 'Trominoes',
  layouts: { I, L },
};

export default trominoes;
