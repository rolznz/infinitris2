import IBlock from '@models/IBlock';

export type AIAction = {
  dx: number;
  dy: number;
  dr: number;
  drop?: boolean;
};

export interface IAIBehaviour {
  calculateNextAction(block: IBlock): AIAction;
}
