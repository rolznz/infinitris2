import { GameModeEvent } from '@models/GameModeEvent';

export interface IGameModeEventListener {
  /**
   * Fired when a custom game mode event occurs
   * @param event
   */
  onGameModeEvent(event: GameModeEvent): void;
}
