import InputAction from './InputAction';
import Layout from './Layout';
import blockPlacement from './tutorials/BlockPlacement';

interface CellLocation {
  readonly col: number;
  readonly row: number;
}

export default interface Tutorial {
  readonly title: string;
  readonly description: string;
  readonly gridWidth: number;
  readonly gridHeight: number;
  readonly filledCellLocations?: CellLocation[];
  readonly filledRows?: number[];
  readonly layout?: Layout;
  readonly highlightScore?: boolean;
  readonly layoutRotation?: number;
  readonly allowedActions?: InputAction[];
}

export const tutorials: Tutorial[] = [blockPlacement];
