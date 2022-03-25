import { PlayerStatus } from '@models/IPlayer';
import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerPlayerChangeStatusEvent extends IServerMessage {
  playerId: number;
  status: PlayerStatus;
}
