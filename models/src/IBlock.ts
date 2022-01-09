import Layout from './Layout';
import ICell from './ICell';
import { IPlayer } from './IPlayer';
import { SimulationSettings } from './SimulationSettings';

export type BlockCanMoveOptions = {
  allowMistakes: boolean;
  isMistake?: boolean;
  cells?: ICell[];
};

export type NetworkBlockInfo = {
  readonly playerId: number;
  readonly row: number;
  readonly column: number;
  readonly rotation: number;
  readonly isDropping: boolean;
  readonly layoutId: number;
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
  update(): void;
  canMove(
    dx: number,
    dy: number,
    dr: number,
    options?: BlockCanMoveOptions
  ): boolean;
  move(dx: number, dy: number, dr: number, force?: boolean): boolean;
  drop(): void;
  cancelDrop(): void;
  slowDown(row: number): void;
  place(): void;
  die(): void;
  destroy(): void;
}
