import Player from '@core/player/Player';
import ISimulation from '@models/ISimulation';

export default class ControllablePlayer extends Player {
  constructor(
    simulation: ISimulation,
    playerId: number,
    nickname?: string,
    color?: number
  ) {
    super(simulation, playerId, nickname, color);
  }
}
