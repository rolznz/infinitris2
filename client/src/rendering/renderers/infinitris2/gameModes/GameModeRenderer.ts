import { IPlayer } from '@models/IPlayer';

export interface IGameModeRenderer {
  onSimulationStep(): void;
  onPlayerDestroyed(player: IPlayer): void;
}
