import { GameModeEvent } from '@models/GameModeEvent';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerGameModeEvent extends IServerMessage {
  data: GameModeEvent;
}
