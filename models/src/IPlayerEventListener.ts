import { IPlayer } from '@models/IPlayer';
import IBlockEventListener from '@models/IBlockEventListener';

export interface IPlayerEventListener extends IBlockEventListener {
  onPlayerCreated(player: IPlayer): void;
  onPlayerDestroyed(player: IPlayer): void;
  onPlayerToggleChat(player: IPlayer, wasCancelled: boolean): void;
  onPlayerToggleSpectating(player: IPlayer): void;
}
