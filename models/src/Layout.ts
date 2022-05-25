import tetrominoes from '@models/blockLayouts/Tetrominoes';

type Layout = number[][];

export default Layout;

export type LayoutSet = {
  id: string;
  name: string;
  layouts: { [key: string]: Layout };
};

export const defaultLayoutSet = tetrominoes;
