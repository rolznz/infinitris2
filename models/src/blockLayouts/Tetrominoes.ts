import Layout, { LayoutSet } from '../Layout';

export const I: Layout = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
];

export const J: Layout = [
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 0],
];

export const L: Layout = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 1],
];

export const O: Layout = [
  [1, 1],
  [1, 1],
];

export const S: Layout = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0],
];

export const T: Layout = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0],
];

export const Z: Layout = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
];

const tetrominoes: LayoutSet = {
  id: 'tetrominoes',
  name: 'Tetrominoes',
  layouts: { I, J, L, O, S, T, Z },
};

export default tetrominoes;
