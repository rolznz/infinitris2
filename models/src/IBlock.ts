import Layout from './Layout';
import ICell from './ICell';
import { IPlayer } from './IPlayer';
import { SimulationSettings } from './SimulationSettings';

export type BlockCanMoveOptions = {
  allowMistakes: boolean;
  allowTowers?: boolean;
  isMistake?: boolean;
  cells?: ICell[];
  isForgiving?: boolean;
};

export type NetworkBlockInfo = {
  readonly playerId: number;
  readonly row: number;
  readonly column: number;
  readonly rotation: number;
  readonly isDropping: boolean;
  readonly layoutId: number;
  readonly blockId: number;
};

export default interface IBlock {
  get player(): IPlayer;
  get cells(): ICell[];
  get width(): number;
  get height(): number;
  get row(): number;
  get column(): number;
  get centreX(): number;
  get isDropping(): boolean;
  get layoutId(): number;
  get initialLayout(): Layout;
  get layout(): Layout;
  get rotation(): number;
  get bottomRow(): number;
  get topRow(): number;
  get id(): number;
  get isAlive(): boolean;
  get hadPlacementAtSpawn(): boolean;
  get wasPlaced(): boolean;
  hasPlacement(): boolean;
  update(): void;
  canMove(
    dx: number,
    dy: number,
    dr: number,
    options?: BlockCanMoveOptions
  ): boolean;
  move(
    dx: number,
    dy: number,
    dr: number,
    force?: boolean,
    rotateDown?: boolean
  ): boolean;
  drop(): void;
  cancelDrop(): void;
  slowDown(): void;
  place(): void;
  die(): void;
  destroy(): void;
  getPlacementCells(): ICell[];
}
