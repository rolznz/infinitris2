import Layout from './Layout';

const I: Layout = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
];

const J: Layout = [
  [0, 1, 0],
  [0, 1, 0],
  [1, 1, 0],
];

const L: Layout = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 1],
];

const O: Layout = [
  [1, 1],
  [1, 1],
];

const S: Layout = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 0, 0],
];

const T: Layout = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 0, 0],
];

const Z: Layout = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 0, 0],
];

const tetrominoes = [I, J, L, O, S, T, Z];

export default tetrominoes;
