import ICell from '@models/ICell';
import { SimulationSettings } from '@models/SimulationSettings';
import { DumbAIBehaviour } from './ai/DumbAIBehaviour';
import { IAIBehaviour } from './ai/IAIBehaviour';
import Player from './Player';

const reflexDelay = 100;

export default class AIPlayer extends Player {
  private _nextReflex = 0;
  private _behaviour: IAIBehaviour;
  constructor(playerId: number, nickname: string, color: number) {
    super(playerId, nickname, color);
    this._behaviour = new DumbAIBehaviour();
  }

  update(gridCells: ICell[][], simulationSettings: SimulationSettings) {
    super.update(gridCells, simulationSettings);

    if (this._block && !this._block.isDropping) {
      if (this._nextReflex >= reflexDelay) {
        this._nextReflex = 0;
        const nextAction = this._behaviour.calculateNextAction(
          this._block,
          gridCells
        );
        if (nextAction.dx || nextAction.dy || nextAction.dr) {
          this._block.move(
            gridCells,
            nextAction.dx,
            nextAction.dy,
            nextAction.dr
          );
        } else if (nextAction.drop) {
          this._block.drop();
        }
      } else {
        ++this._nextReflex;
      }
    }
  }
}
