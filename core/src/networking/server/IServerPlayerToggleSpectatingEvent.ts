import { IServerMessage } from '@models/networking/server/IServerMessage';

export interface IServerPlayerToggleSpectatingEvent extends IServerMessage {
  playerId: number;
  isSpectating: boolean;
}
