import Layout, { LayoutSet } from '../Layout';

const I: Layout = [
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0],
];

const F: Layout = [
  [0, 1, 1],
  [1, 1, 0],
  [0, 1, 0],
];

const FF: Layout = [
  [1, 1, 0],
  [0, 1, 1],
  [0, 1, 0],
];

const L: Layout = [
  [0, 0, 0, 0],
  [0, 0, 0, 1],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
];

const J: Layout = [
  [0, 0, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
];

const P: Layout = [
  [1, 1, 0],
  [1, 1, 1],
  [0, 0, 0],
];

const PP: Layout = [
  [0, 1, 1],
  [1, 1, 1],
  [0, 0, 0],
];

const W: Layout = [
  [0, 0, 0, 0],
  [1, 1, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 0, 0],
];

const WW: Layout = [
  [0, 0, 0, 0],
  [0, 1, 1, 1],
  [1, 1, 0, 0],
  [0, 0, 0, 0],
];

const T: Layout = [
  [1, 1, 1],
  [0, 1, 0],
  [0, 1, 0],
];

const U: Layout = [
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 0],
];

const DV: Layout = [
  [0, 0, 1],
  [0, 0, 1],
  [1, 1, 1],
];

const DW: Layout = [
  [0, 0, 1],
  [0, 1, 1],
  [1, 1, 0],
];

const C: Layout = [
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0],
];

const G: Layout = [
  [0, 0, 0, 0],
  [0, 0, 1, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
];

const GG: Layout = [
  [0, 0, 0, 0],
  [0, 1, 0, 0],
  [1, 1, 1, 1],
  [0, 0, 0, 0],
];

const S: Layout = [
  [0, 1, 1],
  [0, 1, 0],
  [1, 1, 0],
];

const Z: Layout = [
  [1, 1, 0],
  [0, 1, 0],
  [0, 1, 1],
];

const pentominoes: LayoutSet = {
  id: 'pentominoes',
  name: 'Pentominoes',
  layouts: { I, F, FF, L, J, P, PP, W, WW, T, U, DV, DW, C, G, GG, S, Z },
};

export default pentominoes;
