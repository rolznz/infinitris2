import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerBlockDiedEvent extends IServerMessage {
  playerId: number;
}
