import { IPlayer } from '@models/IPlayer';
import IBlockEventListener from '@models/IBlockEventListener';

export interface IPlayerEventListener extends IBlockEventListener {
  onPlayerCreated(player: IPlayer): void;
  onPlayerDestroyed(player: IPlayer): void;
  onPlayerScoreChanged(player: IPlayer, amount: number): void;
  onPlayerHealthChanged(player: IPlayer, amount: number): void;
  onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void;
  onPlayerChangeStatus(player: IPlayer): void;
}
