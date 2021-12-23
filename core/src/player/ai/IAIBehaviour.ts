import IBlock from '@models/IBlock';
import ICell from '@models/ICell';

export type AIAction = {
  dx: number;
  dy: number;
  dr: number;
  drop?: boolean;
};

export interface IAIBehaviour {
  calculateNextAction(block: IBlock, gridCells: ICell[][]): AIAction;
}
